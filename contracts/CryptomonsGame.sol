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
    }
    
    struct Owner {
        bool isInitialized;
        uint[] cryptomonIds;
    }

    uint public starterCryptomonCost = 1 ether;  // cost of creating a starter cryptomon

    uint public totalCryptomons = 0;             // count of all cryptomons
    uint max = 2**256 - 1;                       // maximum number of cryptomons this game supports

    // maps id => cryptomon
    mapping(uint => Cryptomon) public cryptomons;
    
    // maps owner => owned cryptomon ids
    mapping(address => Owner) public owners;

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
        owners[owner].isInitialized = true;
        owners[owner].cryptomonIds.push(starter.id);
        totalCryptomons++;
    }

//    function breed(uint8 parentAId, uint8 parentBId) public returns (bool) {
//        address owner = msg.sender;
//        require(parentAId < cryptomons[owner].length, "Parent A does not exist");
//        require(parentBId < cryptomons[owner].length, "Parent B does not exist");
//        Cryptomon memory parentA = cryptomons[owner][parentAId];
//        Cryptomon memory parentB = cryptomons[owner][parentBId];
//        Cryptomon memory child = Cryptomon(parentA.element, (parentA.health + parentB.health) / 2, (parentA.strength + parentB.strength) / 2, owner);
//        cryptomons[owner].push(child);
//        return true;
//    }

    function isOwnerInitialized(address owner) public view returns (bool) {
        return owners[owner].isInitialized;
    }

    function getCryptomonCountByOwner(address owner) public view returns (uint) {
        return owners[owner].cryptomonIds.length;
    }

    function getCryptomonIdsByOwner(address owner) public view returns (uint[] memory ids) {
        ids = owners[owner].cryptomonIds;
    }

    function getCryptomon(uint id)
        public view
        returns (string memory name, Element element, uint health, uint strength, address owner) {
        require(id < totalCryptomons, "Cryptomon does not exist.");
        Cryptomon memory cryptomon = cryptomons[id];
        name = cryptomon.name;
        element = cryptomon.element;
        health = cryptomon.health;
        strength = cryptomon.strength;
        owner = cryptomon.owner;
    }
}
