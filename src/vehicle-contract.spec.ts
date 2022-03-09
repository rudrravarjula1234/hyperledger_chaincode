/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { VehicleContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logger = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('VehicleContract', () => {

    let contract: VehicleContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new VehicleContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"vehicle 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"vehicle 1002 value"}'));
    });

    describe('#vehicleExists', () => {

        it('should return true for a vehicle', async () => {
            await contract.vehicleExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a vehicle that does not exist', async () => {
            await contract.vehicleExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createVehicle', () => {

        it('should create a vehicle', async () => {
            await contract.createVehicle(ctx, '1003', 'vehicle 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"vehicle 1003 value"}'));
        });

        it('should throw an error for a vehicle that already exists', async () => {
            await contract.createVehicle(ctx, '1001', 'myvalue').should.be.rejectedWith(/The vehicle 1001 already exists/);
        });

    });

    describe('#readVehicle', () => {

        it('should return a vehicle', async () => {
            await contract.readVehicle(ctx, '1001').should.eventually.deep.equal({ value: 'vehicle 1001 value' });
        });

        it('should throw an error for a vehicle that does not exist', async () => {
            await contract.readVehicle(ctx, '1003').should.be.rejectedWith(/The vehicle 1003 does not exist/);
        });

    });

    describe('#updateVehicle', () => {

        it('should update a vehicle', async () => {
            await contract.updateVehicle(ctx, '1001', 'vehicle 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"vehicle 1001 new value"}'));
        });

        it('should throw an error for a vehicle that does not exist', async () => {
            await contract.updateVehicle(ctx, '1003', 'vehicle 1003 new value').should.be.rejectedWith(/The vehicle 1003 does not exist/);
        });

    });

    describe('#deleteVehicle', () => {

        it('should delete a vehicle', async () => {
            await contract.deleteVehicle(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a vehicle that does not exist', async () => {
            await contract.deleteVehicle(ctx, '1003').should.be.rejectedWith(/The vehicle 1003 does not exist/);
        });

    });

});
