/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Vehicle } from './vehicle';

@Info({title: 'VehicleContract', description: 'My Smart Contract' })
export class VehicleContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async vehicleExists(ctx: Context, vehicleId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(vehicleId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async createVehicle(ctx: Context, vehicleId: string, brand: string, capacity: number, model: string, name:string,owner: string): Promise<void> {
        const exists: boolean = await this.vehicleExists(ctx, vehicleId);
        if (exists) {
            throw new Error(`The vehicle ${vehicleId} already exists`);
        }
        const vehicle: Vehicle = new Vehicle();
        vehicle.brand = brand;
        vehicle.capacity = capacity;
        vehicle.model = model;
        vehicle.name = name;
        vehicle.owner = owner;
        const buffer: Buffer = Buffer.from(JSON.stringify(vehicle));
        await ctx.stub.putState(vehicleId, buffer);
        const eventPayload: Buffer = Buffer.from(`Created asset ${vehicleId}`);
        ctx.stub.setEvent('addAsset', eventPayload);
    }

    @Transaction(false)
    @Returns('Vehicle')
    public async readVehicle(ctx: Context, vehicleId: string): Promise<Vehicle> {
        const exists: boolean = await this.vehicleExists(ctx, vehicleId);
        if (!exists) {
            throw new Error(`The vehicle ${vehicleId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(vehicleId);
        const vehicle: Vehicle = JSON.parse(data.toString()) as Vehicle;
        return vehicle;
    }

    @Transaction()
    public async updateVehicle(ctx: Context, vehicleId: string, newValue: string): Promise<void> {
        const exists: boolean = await this.vehicleExists(ctx, vehicleId);
        if (!exists) {
            throw new Error(`The vehicle ${vehicleId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(vehicleId);
        const vehicle: Vehicle = JSON.parse(data.toString()) as Vehicle;
        vehicle.owner = newValue;
        const buffer: Buffer = Buffer.from(JSON.stringify(vehicle));
        await ctx.stub.putState(vehicleId, buffer);
        const eventPayload: Buffer = Buffer.from(`Updated asset ${vehicleId}`);
        ctx.stub.setEvent('updateAsset', eventPayload);
    }

    @Transaction()
    public async deleteVehicle(ctx: Context, vehicleId: string): Promise<void> {
        const exists: boolean = await this.vehicleExists(ctx, vehicleId);
        if (!exists) {
            throw new Error(`The vehicle ${vehicleId} does not exist`);
        }
        await ctx.stub.deleteState(vehicleId);
        const eventPayload: Buffer = Buffer.from(`Deleted asset ${vehicleId}`);
        ctx.stub.setEvent('delAsset', eventPayload);
    }

    @Transaction(false)
    public async getAllVehicles(ctx: Context): Promise<string> {
        const startIndex = '000'
        const endKey = ''
        const iterator = await ctx.stub.getStateByRange(startIndex,endKey);
        const allResults = [];
        while (true){
            const res = await iterator.next();
            if(res.value && res.value.value.toString()){
                const Key = res.value.key;
                let Record;
                try{
                    Record = JSON.parse(res.value.value.toString());
                } catch(err){
                    Record = res.value.value.toString();
                }
                allResults.push(Record);
            }
            if(res.done){
                await iterator.close();
                return JSON.stringify(allResults);
            }
        }
    }
}
