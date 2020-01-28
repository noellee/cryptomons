pragma solidity >=0.4.21 <0.7.0;

contract CryptomonsGame {
    enum Element {Fire, Water, Earth, Electricity, Air}

    struct Cryptomon {
        Element element;
        uint health;
        uint strength;
        address owner;
    }

    // maps owner => cryptomons
    mapping(address => Cryptomon[]) public cryptomons;

    function initStarterCryptomons() public {
        address owner = msg.sender;
        require(cryptomons[owner].length == 0, "Not a new user.");
        Cryptomon memory starter1 = Cryptomon(Element.Fire, 100, 85, owner);
        Cryptomon memory starter2 = Cryptomon(Element.Water, 80, 100, owner);
        cryptomons[owner].push(starter1);
        cryptomons[owner].push(starter2);
    }

    function breed(uint8 parentAId, uint8 parentBId) public returns (bool) {
        address owner = msg.sender;
        require(parentAId < cryptomons[owner].length, "Parent A does not exist");
        require(parentBId < cryptomons[owner].length, "Parent B does not exist");
        Cryptomon memory parentA = cryptomons[owner][parentAId];
        Cryptomon memory parentB = cryptomons[owner][parentBId];
        Cryptomon memory child = Cryptomon(parentA.element, (parentA.health + parentB.health) / 2, (parentA.strength + parentB.strength) / 2, owner);
        cryptomons[owner].push(child);
        return true;
    }

    function getCryptomonCount(address owner) public view returns (uint) {
        return cryptomons[owner].length;
    }

    function getCryptomon(address owner, uint index)
        public view
        returns (Element element, uint health, uint strength) {
        require(index < cryptomons[owner].length, "Index out of bounds.");
        Cryptomon memory cryptomon = cryptomons[owner][index];
        element = cryptomon.element;
        health = cryptomon.health;
        strength = cryptomon.strength;
    }
}
