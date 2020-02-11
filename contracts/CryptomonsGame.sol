pragma solidity >=0.6.0 <0.7.0;

contract CryptomonsGame {

    //////////////////////////////////////
    // ENUMS
    //////////////////////////////////////

    enum Element {Fire, Water, Earth, Electricity, Air}

    enum State {Idle, OnSale, InAnOffer, Shared, ReadyToFight, InAChallenge}

    //////////////////////////////////////
    // STRUCTS
    //////////////////////////////////////

    struct Cryptomon {
        uint id;
        string name;
        Element primaryElement;
        Element secondaryElement;
        uint health;
        uint strength;
        address owner;
        address coOwner;
        State state;
    }

    struct Owner {
        bool isInitialized;
        uint[] cryptomonIds;
    }

    struct Offer {
        address buyer;
        uint price;
        uint[] cryptomonIds;  // buyer cryptomons
    }

    struct Challenge {
        uint stake;
        uint challengerId;
    }

    //////////////////////////////////////
    // STATE VARIABLES
    //////////////////////////////////////

    uint public starterCryptomonCost = 1 ether;  // cost of creating a starter cryptomon

    uint public totalCryptomons = 0;             // count of all cryptomons
    uint max = 2 ** 256 - 1;                     // maximum number of cryptomons this game supports

    // maps id => cryptomon
    mapping(uint => Cryptomon) public cryptomons;

    // maps owner address => owner
    mapping(address => Owner) public owners;

    // maps co-owner address => co-owned cryptomon ids
    mapping(address => uint[]) public coOwners;

    // maps cryptomonId => offers
    mapping(uint => Offer) public offers;

    // maps cryptomonId => challenges
    mapping(uint => Challenge) public challenges;

    // maps account address => amount of wei owed to them
    mapping(address => uint) private balances;

    //////////////////////////////////////
    // MODIFIERS
    //////////////////////////////////////

    modifier isIdle(uint cryptomonId) {
        require(cryptomons[cryptomonId].state == State.Idle, "Cryptomon must be in idle state.");
        _;
    }

    modifier onlyOwner(uint cryptomonId) {
        require(
            msg.sender == cryptomons[cryptomonId].owner,
            "Only the owner of this Cryptomon can call this method."
        );
        _;
    }

    modifier onlyOwnerOrCoOwner(uint cryptomonId) {
        require(
            msg.sender == cryptomons[cryptomonId].owner
            || msg.sender == cryptomons[cryptomonId].coOwner,
            "Only the owner or co-owner of this Cryptomon can call this method."
        );
        _;
    }

    modifier cryptomonExists(uint cryptomonId) {
        require(cryptomonId < totalCryptomons, "Cryptomon does not exist");
        _;
    }

    modifier isUnderOffer(uint cryptomonId) {
        require(cryptomons[cryptomonId].state == State.OnSale, "Cryptomon is not on sale");
        require(offers[cryptomonId].buyer != address(0x0), "There is no offer for this Cryptomon.");
        _;
    }

    modifier isShared(uint cryptomonId) {
        require(
            cryptomons[cryptomonId].state == State.Shared,
            "Cryptomon must be currently shared."
        );
        _;
    }

    modifier isNotShared(uint cryptomonId) {
        require(
            cryptomons[cryptomonId].state != State.Shared,
            "Cryptomon must not be currently shared."
        );
        _;
    }

    modifier isReadyToFight(uint cryptomonId) {
        require(
            cryptomons[cryptomonId].state == State.ReadyToFight,
            "Cryptomon must be ready to fight."
        );
        _;
    }

    modifier isInAChallenge(uint cryptomonId) {
        require(
            cryptomons[cryptomonId].state == State.InAChallenge,
            "Cryptomon must be in a challenge."
        );
        _;
    }

    modifier canBreed(uint id) {
        require(
            cryptomons[id].state == State.Shared || cryptomons[id].state == State.Idle,
            "Cryptomon cannot breed right now."
        );
        _;
    }

    //////////////////////////////////////
    // PUBLIC GETTERS
    //////////////////////////////////////

    function isOwnerInitialized(address owner) public view returns (bool) {
        return owners[owner].isInitialized;
    }

    function getCryptomonCountByOwner(address owner) public view returns (uint) {
        return owners[owner].cryptomonIds.length;
    }

    function getCryptomonIdsByOwner(address owner) public view returns (uint[] memory ids) {
        ids = owners[owner].cryptomonIds;
    }

    function getCryptomonIdsByCoOwner(address coOwner) public view returns (uint[] memory ids) {
        ids = coOwners[coOwner];
    }

    // todo: combine?
    function getOfferedCryptomonsCount(uint id) public view returns (uint count) {
        count = offers[id].cryptomonIds.length;
    }

    function getOfferedCryptomonByIndex(uint id, uint index) public view returns (uint cryptomonId) {
        require(index < offers[id].cryptomonIds.length, "Index out of bounds.");
        cryptomonId = offers[id].cryptomonIds[index];
    }

    //////////////////////////////////////
    // FEATURE: WITHDRAW FROM BALANCE
    //////////////////////////////////////

    function getBalance() public view returns (uint balance) {
        balance = balances[msg.sender];
    }

    function withdrawFunds(uint amount) external {
        require(amount <= getBalance(), "Cannot withdraw more than the account balance.");
        balances[msg.sender] -= amount;
        msg.sender.transfer(amount);
    }

    function addToBalance(address account, uint amount) private {
        uint result = balances[account] + amount;
        require(result >= balances[account], "Maximum balance exceeded.");
        balances[account] = result;
    }

    //////////////////////////////////////
    // FEATURE: INIT STARTER
    //////////////////////////////////////

    function initStarterCryptomon(string calldata name, Element element) external payable {
        require(msg.value == starterCryptomonCost, "Sent eth does not match starter cryptomon cost");

        address owner = msg.sender;
        require(!owners[owner].isInitialized, "Not a new user.");

        Cryptomon storage starter = createCryptomon(owner, element, element, name, 80, 80);

        owners[owner].isInitialized = true;
        emit StarterCryptomonCreated(starter.id);
    }

    function createCryptomon(address owner, Element primaryElement, Element secondaryElement, string memory name, uint health, uint strength)
    private returns (Cryptomon storage cryptomon) {
        require(totalCryptomons < max, "Cannot create any more Cryptomons in this game.");
        cryptomon = cryptomons[totalCryptomons];
        cryptomon.id = totalCryptomons;
        cryptomon.owner = owner;
        cryptomon.coOwner = address(0x0);
        cryptomon.primaryElement = primaryElement;
        cryptomon.secondaryElement = secondaryElement;
        cryptomon.name = name;
        cryptomon.health = health;
        cryptomon.strength = strength;
        owners[owner].cryptomonIds.push(cryptomon.id);
        totalCryptomons++;
    }

    //////////////////////////////////////
    // FEATURE: TRADING
    //////////////////////////////////////

    /// @notice Puts a Cryptomon up for sale
    /// @param id The id of the Cryptomon to sell
    function sell(uint id)
    external cryptomonExists(id) onlyOwner(id) isIdle(id) isNotShared(id) {
        cryptomons[id].state = State.OnSale;
        emit CryptomonPutOnSale(id);
    }

    /// @notice Make an offer to buy a Cryptomon. The value sent is the offered price.
    /// @param cryptomonId The id of the Cryptomon to buy
    /// @param cryptomonIds The ids of the buyer's Cryptomons to be offered to exchange for the seller's Cryptomon
    function makeOffer(uint cryptomonId, uint[] calldata cryptomonIds)
    external cryptomonExists(cryptomonId) payable {

        require(cryptomons[cryptomonId].state == State.OnSale, "Cryptomon is not on sale.");
        require(cryptomons[cryptomonId].owner != msg.sender, "Cannot make an offer for your own Cryptomon.");
        require(offers[cryptomonId].buyer == address(0x0), "An offer has already been made for this Cryptomon");

        for (uint i = 0; i < cryptomonIds.length; i++) {
            require(
                cryptomons[cryptomonIds[i]].owner == msg.sender,
                "All Cryptomons in the offer must be owned by the buyer."
            );
            require(
                cryptomons[cryptomonIds[i]].state == State.Idle,
                "All Cryptomons in the offer must be idle."
            );
            cryptomons[cryptomonIds[i]].state = State.InAnOffer;
        }

        Offer storage offer = offers[cryptomonId];
        offer.buyer = msg.sender;
        offer.price = msg.value;
        offer.cryptomonIds = cryptomonIds;

        emit OfferMade(cryptomonId);
    }

    /// @notice Accept an offer that has been made to a Cryptomon. Only the owner of the Cryptomon can call this.
    /// @param cryptomonId The id of the Cryptomon to accept the offer for
    function acceptOffer(uint cryptomonId)
    external cryptomonExists(cryptomonId) onlyOwner(cryptomonId) isUnderOffer(cryptomonId) {

        address seller = msg.sender;

        Offer memory offer = offers[cryptomonId];
        delete offers[cryptomonId];

        // not on sale any more
        cryptomons[cryptomonId].state = State.Idle;

        // the cryptomon under offer is transferred to the buyer
        transferOwnership(cryptomonId, offer.buyer);

        // buyer's cryptomons gets sent to seller
        for (uint i = 0; i < offer.cryptomonIds.length; i++) {
            transferOwnership(offer.cryptomonIds[i], seller);
            cryptomons[offer.cryptomonIds[i]].state = State.Idle;
        }

        // buyer's deposit gets sent to seller
        addToBalance(seller, offer.price);

        emit OfferAccepted(cryptomonId);
    }

    /// @notice Reject an offer that has been made to a Cryptomon. Only the owner of the Cryptomon can call this.
    /// @param cryptomonId The id of the Cryptomon to reject the offer for
    function rejectOffer(uint cryptomonId)
    external cryptomonExists(cryptomonId) onlyOwner(cryptomonId) isUnderOffer(cryptomonId) {
        cancelOffer(cryptomonId);
        emit OfferRejected(cryptomonId);
    }

    /// @notice Withdraw an offer that has been made to a Cryptomon. Only the buyer can call this.
    /// @param cryptomonId The id of the Cryptomon to withdraw the offer for
    function withdrawOffer(uint cryptomonId)
    external cryptomonExists(cryptomonId) isUnderOffer(cryptomonId) {
        require(offers[cryptomonId].buyer == msg.sender, "Only the buyer can withdraw an offer.");
        cancelOffer(cryptomonId);
        emit OfferWithdrawn(cryptomonId);
    }

    function cancelOffer(uint cryptomonId) private {
        Offer memory offer = offers[cryptomonId];
        delete offers[cryptomonId];

        // buyer's cryptomons are no longer in an offer
        for (uint i = 0; i < offer.cryptomonIds.length; i++) {
            cryptomons[offer.cryptomonIds[i]].state = State.Idle;
        }

        // refund buyer's deposit
        addToBalance(offer.buyer, offer.price);
    }

    //////////////////////////////////////
    // FEATURE: BREEDING
    //////////////////////////////////////

    function breed(uint parent1Id, uint parent2Id, string calldata name)
    external
    onlyOwnerOrCoOwner(parent1Id) canBreed(parent1Id)
    onlyOwnerOrCoOwner(parent2Id) canBreed(parent2Id) {
        uint health = (cryptomons[parent1Id].health + cryptomons[parent2Id].health) / 2 + 10;
        uint strength = (cryptomons[parent1Id].strength + cryptomons[parent2Id].strength) / 2 + 10;
        Element pElement = cryptomons[parent1Id].primaryElement;
        Element sElement = cryptomons[parent2Id].primaryElement;
        Cryptomon storage cryptomon = createCryptomon(msg.sender, pElement, sElement, name, health, strength);
        emit CryptomonBirth(cryptomon.id);
    }

    function transferOwnership(uint cryptomonId, address to) private {
        address from = cryptomons[cryptomonId].owner;
        cryptomons[cryptomonId].owner = to;
        owners[to].cryptomonIds.push(cryptomonId);
        deleteElementFromArray(owners[from].cryptomonIds, cryptomonId);
    }

    //////////////////////////////////////
    // FEATURE: FIGHTING
    //////////////////////////////////////

    function readyToFight(uint cryptomonId)
    external cryptomonExists(cryptomonId) onlyOwner(cryptomonId) isIdle(cryptomonId) {
        cryptomons[cryptomonId].state = State.ReadyToFight;
    }

    function leaveFight(uint cryptomonId)
    external cryptomonExists(cryptomonId) onlyOwner(cryptomonId) isReadyToFight(cryptomonId) {
        cryptomons[cryptomonId].state = State.Idle;
    }

    // @param opponentId The id of the Cryptomon being challenged
    // @param challenger The id of the challenger Cryptomon
    function challenge(uint opponentId, uint challengerId)
    external payable
    cryptomonExists(opponentId) isReadyToFight(opponentId)
    cryptomonExists(challengerId) isReadyToFight(challengerId) onlyOwner(challengerId) {
        Cryptomon storage challenger = cryptomons[challengerId];
        Cryptomon storage opponent = cryptomons[opponentId];
        require(challenger.owner != opponent.owner, "Can't fight your own Cryptomons.");
        Challenge storage newChallenge = challenges[opponent.id];
        newChallenge.challengerId = challenger.id;
        newChallenge.stake = msg.value;
        challenger.state = State.InAChallenge;
        opponent.state = State.InAChallenge;
    }

    function rejectChallenge(uint cryptomonId)
    external cryptomonExists(cryptomonId) isInAChallenge(cryptomonId) onlyOwner(cryptomonId) {
        removeChallenge(cryptomonId);
    }

    function withdrawChallenge(uint cryptomonId)
    external cryptomonExists(cryptomonId) isInAChallenge(cryptomonId) {
        require(
            cryptomons[challenges[cryptomonId].challengerId].owner == msg.sender,
            "Only the challenger can withdraw."
        );
        removeChallenge(cryptomonId);
    }

    function removeChallenge(uint cryptomonId) private {
        uint challengerId = challenges[cryptomonId].challengerId;
        cryptomons[cryptomonId].state = State.ReadyToFight;
        cryptomons[challengerId].state = State.ReadyToFight;
        delete challenges[cryptomonId];
    }

    function acceptChallenge(uint cryptomonId)
    external payable
    cryptomonExists(cryptomonId) isInAChallenge(cryptomonId) onlyOwner(cryptomonId) {
        Challenge storage _challenge = challenges[cryptomonId];
        require(msg.value == _challenge.stake, "Expected stake to be matched.");
        uint challengerId = _challenge.challengerId;
        Cryptomon storage challenger = cryptomons[challengerId];
        Cryptomon storage opponent = cryptomons[cryptomonId];
        require(challenger.owner != opponent.owner, "Can't fight your own Cryptomons.");
        uint challengerHealth = deductHealth(challenger.health, opponent.strength);
        uint opponentHealth = deductHealth(opponent.health, challenger.strength);
        challenger.state = State.Idle;
        opponent.state = State.Idle;

        if (challengerHealth > opponentHealth) {
            addToBalance(challenger.owner, _challenge.stake * 2);
            emit Fight(opponent.id, challenger.id, challenger.id, challenger.owner);
        } else if (challengerHealth < opponentHealth) {
            addToBalance(opponent.owner, _challenge.stake * 2);
            emit Fight(opponent.id, challenger.id, opponent.id, opponent.owner);
        } else {
            addToBalance(opponent.owner, _challenge.stake);
            addToBalance(challenger.owner, _challenge.stake);
            emit Fight(opponent.id, challenger.id, 0, address(0x0));
        }
    }

    function deductHealth(uint health, uint deduct) private pure returns (uint) {
        if (deduct > health) {
            return 0;
        }
        return health - deduct;
    }

    //////////////////////////////////////
    // FEATURE: SHARING
    //////////////////////////////////////

    function share(uint cryptomonId, address to)
    external cryptomonExists(cryptomonId) onlyOwner(cryptomonId) isIdle(cryptomonId) {
        require(to != address(0x0), "Cannot share with empty address.");
        require(to != msg.sender, "Cannot share with yourself.");
        cryptomons[cryptomonId].coOwner = to;
        cryptomons[cryptomonId].state = State.Shared;
        coOwners[to].push(cryptomonId);
    }

    function endSharing(uint cryptomonId)
    external cryptomonExists(cryptomonId) onlyOwner(cryptomonId) isShared(cryptomonId) {
        address coOwner = cryptomons[cryptomonId].coOwner;
        cryptomons[cryptomonId].coOwner = address(0x0);
        cryptomons[cryptomonId].state = State.Idle;
        deleteElementFromArray(coOwners[coOwner], cryptomonId);
    }

    //////////////////////////////////////
    // MISC HELPERS
    //////////////////////////////////////

    function findIndex(uint[] storage array, uint element) private view returns (uint) {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == element) {
                return i;
            }
        }
        require(false, "Element not present in array");
        return 0;
    }

    function deleteElementFromArray(uint[] storage array, uint element) private {
        uint index = findIndex(array, element);
        array[index] = array[array.length - 1];
        delete array[array.length - 1];
        array.pop();
    }

    //////////////////////////////////////
    // EVENTS
    //////////////////////////////////////

    event StarterCryptomonCreated(uint id);
    event OfferMade(uint id);
    event OfferAccepted(uint id);
    event OfferRejected(uint id);
    event OfferWithdrawn(uint id);
    event CryptomonPutOnSale(uint id);
    event CryptomonBirth(uint id);
    event Fight(uint opponentId, uint challengerId, uint winnerId, address winnerOwner);
}
