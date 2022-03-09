/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Vehicle {

    @Property()
    public name: string;
    @Property()
    public brand: string;
    @Property()
    public model: string;
    @Property()
    public owner: string;
    @Property()
    public capacity: number;
}
