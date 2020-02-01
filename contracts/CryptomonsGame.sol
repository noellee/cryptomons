pragma solidity >=0.4.21 <0.7.0;

contract CryptomonsGame {
    enum Element {Fire, Water, Earth, Electricity, Air}

    struct Cryptomon {
        uint id;
        string name;
        Element element;
        uint health;
        uint strength;
        address owner;
        bool isOnSale;
        bool isInAnOffer;
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

    uint public starterCryptomonCost = 1 ether;  // cost of creating a starter cryptomon

    uint public totalCryptomons = 0;             // count of all cryptomons
    uint max = 2 ** 256 - 1;                       // maximum number of cryptomons this game supports

    // maps id => cryptomon
    mapping(uint => Cryptomon) public cryptomons;

    // maps owner => owned cryptomon ids
    mapping(address => Owner) public owners;

    // maps cryptomonId => offers
    mapping(uint => Offer) public offers;

    function initStarterCryptomon(string memory name, Element element) public payable {
        require(totalCryptomons < max, "Cannot create any more Cryptomons in this game.");
        require(msg.value == starterCryptomonCost, "Sent eth does not match starter cryptomon cost");

        address owner = msg.sender;
        require(!owners[owner].isInitialized, "Not a new user.");

        Cryptomon storage starter = cryptomons[totalCryptomons];
        starter.id = totalCryptomons;
        starter.element = element;
        starter.name = name;
        starter.health = 80;
        starter.strength = 80;
        starter.owner = owner;
        starter.isOnSale = false;
        starter.isInAnOffer = false;
        owners[owner].isInitialized = true;
        owners[owner].cryptomonIds.push(starter.id);
        totalCryptomons++;

        emit StarterCryptomonCreated(starter.id);
    }

    function isOwnerInitialized(address owner) public view returns (bool) {
        return owners[owner].isInitialized;
    }

    function getCryptomonCountByOwner(address owner) public view returns (uint) {
        return owners[owner].cryptomonIds.length;
    }

    function getCryptomonIdsByOwner(address owner) public view returns (uint[] memory ids) {
        ids = owners[owner].cryptomonIds;
    }

    modifier onlyOwner(uint cryptomonId) {
        require(
            msg.sender == cryptomons[cryptomonId].owner,
            "Only the owner of this Cryptomon can call this method."
        );
        _;
    }

    modifier cryptomonExists(uint cryptomonId) {
        require(cryptomonId < totalCryptomons, "Cryptomon does not exist");
        _;
    }

    modifier isUnderOffer(uint cryptomonId) {
        require(cryptomons[cryptomonId].isOnSale, "Cryptomon is not on sale");
        require(offers[cryptomonId].buyer != address(0x0), "There is no offer for this Cryptomon.");
        _;
    }

    function sell(uint id) public cryptomonExists(id) onlyOwner(id) {
        require(!cryptomons[id].isOnSale, "Cryptomon is already on sale.");
        require(!cryptomons[id].isInAnOffer, "Cannot sell a Cryptomon that's in an offer");
        cryptomons[id].isOnSale = true;
        
        emit CryptomonPutOnSale(id);
    }

    function makeOffer(uint cryptomonId, uint[] memory cryptomonIds)
        public cryptomonExists(cryptomonId) payable {

        require(cryptomons[cryptomonId].isOnSale, "Cryptomon is not on sale.");
        require(cryptomons[cryptomonId].owner != msg.sender, "Cannot make an offer for your own Cryptomon.");
        require(offers[cryptomonId].buyer == address(0x0), "An offer has already been made for this Cryptomon");

        for (uint i = 0; i < cryptomonIds.length; i++) {
            require(
                cryptomons[cryptomonIds[i]].owner == msg.sender,
                "All Cryptomons in the offer must be owned by the buyer."
            );
            require(
                !cryptomons[cryptomonIds[i]].isInAnOffer,
                "All Cryptomons in the offer must not be in any other offers"
            );
            cryptomons[cryptomonIds[i]].isInAnOffer = true;
        }

        Offer storage offer = offers[cryptomonId];
        offer.buyer = msg.sender;
        offer.price = msg.value;
        offer.cryptomonIds = cryptomonIds;
        
        emit OfferMade(cryptomonId);
    }

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
        array.length--;
    }

    function transferOwnership(uint cryptomonId, address to) private {
        address from = cryptomons[cryptomonId].owner;
        cryptomons[cryptomonId].owner = to;
        owners[to].cryptomonIds.push(cryptomonId);
        deleteElementFromArray(owners[from].cryptomonIds, cryptomonId);
    }

    function acceptOffer(uint cryptomonId)
        public cryptomonExists(cryptomonId) onlyOwner(cryptomonId) isUnderOffer(cryptomonId) {

        address seller = msg.sender;

        Offer memory offer = offers[cryptomonId];
        delete offers[cryptomonId];

        // not on sale any more
        cryptomons[cryptomonId].isOnSale = false;

        // the cryptomon under offer is transferred to the buyer
        transferOwnership(cryptomonId, offer.buyer);

        // buyer's cryptomons gets sent to seller
        for (uint i = 0; i < offer.cryptomonIds.length; i++) {
            transferOwnership(offer.cryptomonIds[i], seller);
            cryptomons[offer.cryptomonIds[i]].isInAnOffer = false;
        }

        // buyer's deposit gets sent to seller
        (bool success,) = seller.call.value(offer.price)("");
        require(success, "Funds transfer did not succeed.");
        
        emit OfferAccepted(cryptomonId);
    }

    function cancelOffer(uint cryptomonId) private {
        Offer memory offer = offers[cryptomonId];
        delete offers[cryptomonId];

        // buyer's cryptomons are no longer in an offer
        for (uint i = 0; i < offer.cryptomonIds.length; i++) {
            cryptomons[offer.cryptomonIds[i]].isInAnOffer = false;
        }

        // refund buyer's deposit
        (bool success,) = offer.buyer.call.value(offer.price)("");
        require(success, "Funds transfer did not succeed.");
    }

    function rejectOffer(uint cryptomonId)
        public cryptomonExists(cryptomonId) onlyOwner(cryptomonId) isUnderOffer(cryptomonId) {
        cancelOffer(cryptomonId);
        emit OfferRejected(cryptomonId);
    }

    function withdrawOffer(uint cryptomonId)
        public cryptomonExists(cryptomonId) isUnderOffer(cryptomonId) {
        require(offers[cryptomonId].buyer == msg.sender, "Only the buyer can withdraw an offer.");
        cancelOffer(cryptomonId);
        emit OfferWithdrawn(cryptomonId);
    }

    event StarterCryptomonCreated(uint id);
    event OfferMade(uint id);
    event OfferAccepted(uint id);
    event OfferRejected(uint id);
    event OfferWithdrawn(uint id);
    event CryptomonPutOnSale(uint id);
}
