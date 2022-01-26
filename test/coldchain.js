// tests with mocha and chai

const { expectEvent, BN } = require("@openzeppelin/test-helpers");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");

const ColdChain = artifacts.require("ColdChain");

contract("ColdChain", (accounts) => {
  before(async () => {
    this.owner = accounts[0];

    this.VACCINE_BRANDS = {
      Pfizer: "Pfizer-BioNTech",
      Moderna: "Moderna",
      Janssen: "Johnson & Johnson's Janssen",
      Sputnik: "Sputnik V",
    };

    this.ModeEnums = {
      ISSUER: { val: "ISSUER", pos: 0 },
      PROVER: { val: "PROVER", pos: 1 },
      VERIFIER: { val: "VERIFIER", pos: 2 },
    };
    this.StatusEnums = {
      manufactured: { val: "MANUFACTURED", pos: 0 },
      delivering1: { val: "DELIVERING_INTERNATIONAL", pos: 1 },
      stored: { val: "STORED", pos: 2 },
      delivering2: { val: "DELIVERING_LOCAL", pos: 3 },
      delivered: { val: "DELIVERED", pos: 4 },
    };

    this.defaultEntities = {
      manufacturerA: { id: accounts[1], mode: this.ModeEnums.PROVER.val },
      manufacturerB: { id: accounts[2], mode: this.ModeEnums.PROVER.val },
      inspector: { id: accounts[3], mode: this.ModeEnums.ISSUER.val },
      distributorGlobal: { id: accounts[4], mode: this.ModeEnums.VERIFIER.val },
      distributorLocal: { id: accounts[5], mode: this.ModeEnums.VERIFIER.val },
      immunizer: { id: accounts[6], mode: this.ModeEnums.ISSUER.val },
      traveller: { id: accounts[7], mode: this.ModeEnums.PROVER.val },
      borderAgent: { id: accounts[8], mode: this.ModeEnums.VERIFIER.val },
    };

    this.defaultVaccineBatches = {
      0: {
        brand: this.VACCINE_BRANDS.Pfizer,
        manufacturer: this.defaultEntities.manufacturerA.id,
      },
      1: {
        brand: this.VACCINE_BRANDS.Moderna,
        manufacturer: this.defaultEntities.manufacturerA.id,
      },
      2: {
        brand: this.VACCINE_BRANDS.Janssen,
        manufacturer: this.defaultEntities.manufacturerB.id,
      },
      3: {
        brand: this.VACCINE_BRANDS.Sputnik,
        manufacturer: this.defaultEntities.manufacturerB.id,
      },
      4: {
        brand: this.VACCINE_BRANDS.Pfizer,
        manufacturer: this.defaultEntities.manufacturerB.id,
      },
      5: {
        brand: this.VACCINE_BRANDS.Pfizer,
        manufacturer: this.defaultEntities.manufacturerA.id,
      },
      6: {
        brand: this.VACCINE_BRANDS.Moderna,
        manufacturer: this.defaultEntities.manufacturerA.id,
      },
      7: {
        brand: this.VACCINE_BRANDS.Moderna,
        manufacturer: this.defaultEntities.manufacturerB.id,
      },
      8: {
        brand: this.VACCINE_BRANDS.Sputnik,
        manufacturer: this.defaultEntities.manufacturerB.id,
      },
      9: {
        brand: this.VACCINE_BRANDS.Janssen,
        manufacturer: this.defaultEntities.manufacturerA.id,
      },
    };

    this.coldChainInstance = await ColdChain.deployed();
    this.providerOrUrl = "http://localhost:8545";
  });


  it("should add entities", async () => {
    for (const entity in this.defaultEntities) {
      const { id, mode } = this.defaultEntities[entity];
      const result = await this.coldChainInstance.addEntity(id, mode, {
        from: this.owner,
      });

      expectEvent(result.receipt, "AddEntity", {
        entityId: id,
        entityMode: mode,
      });

      const retrievedEntity = await this.coldChainInstance.entities.call(id);
      assert.equal(id, retrievedEntity.id, "error: id missmatch");
      assert.equal(this.ModeEnums[mode].pos, retrievedEntity.mode.toString(), "error: mode missmatch");

    }
  });

  it("should add vax batches", async () => {
    for (let i = 0; i < Object.keys(this.defaultVaccineBatches).length; i++) {
      const { brand, manufacturer } = this.defaultVaccineBatches[i];
      const result = await this.coldChainInstance.addVaccineBatch(
        brand,
        manufacturer,
        {
          from: this.owner,
        }
      );

      expectEvent(result.receipt, "AddVaccineBatch", {
      vaccineBatchId: String(i),
        manufacturer: manufacturer,
      });

      const retrievedVaccineBatch = await this.coldChainInstance.vaccineBatches.call(i);
      assert.equal(i, retrievedVaccineBatch.id);
      assert.equal(brand, retrievedVaccineBatch.brand);
      assert.equal(manufacturer, retrievedVaccineBatch.manufacturer);
      assert.equal(undefined, retrievedVaccineBatch.certifivateIds);
    
    
    }
  });

  it("should sign and store certificate", async () => {
    const mnemonic =
      "machine link corn enter marble march spray parent wash front desert misery";
    const providerOrUrl = "http://localhost:8545";
    const provider = new HDWalletProvider({ mnemonic, providerOrUrl });
    this.web3 = new Web3(provider);

    const { inspector, manufacturerA } = this.defaultEntities;
    const vaccineBatchId = 0;
    const message = `Inspector (${inspector.id}) certifies vaccine batch #${vaccineBatchId} for manufacturer (${manufacturerA.id}).`;
    const signature = await this.web3.eth.sign(this.web3.utils.keccak256(message), inspector.id);

    const result = await this.coldChainInstance.issueCertificate(inspector.id, manufacturerA.id, 
      this.StatusEnums.manufactured.val, vaccineBatchId, signature, { from: this.owner });

    expectEvent(result.receipt, "IssueCertificate", {
      issuer: inspector.id,
      prover: manufacturerA.id,
      certificateId: new BN(0),
    });

    const retrievedCertificate = await this.coldChainInstance.certificates.call(0);

    assert.equal(retrievedCertificate.id, 0);
    assert.equal(retrievedCertificate.issuer["id"], inspector.id);
    assert.equal(retrievedCertificate.prover["id"], manufacturerA.id);
    assert.equal(retrievedCertificate.signature, signature);
    assert.equal(retrievedCertificate.status, this.StatusEnums.manufactured.pos.toString());

   });

  it("should verify signature and certificate match", async () => {
    const { inspector, manufacturerA } = this.defaultEntities;
    const vaccineBatchId = 0;
    const message = `Inspector (${inspector.id}) has certified vaccine batch #${vaccineBatchId} for manufacturer (${manufacturerA.id}).`;

    const certificate = await this.coldChainInstance.certificates.call(0);

    const signatureMatches = await this.coldChainInstance.issueCertificate(
      this.web3.utils.keccak256(message),
      certificate.id,
      inspector.id,
      { from: this.owner }
    );



    assert.equal(signatureMatches, true);
  
  });
});
