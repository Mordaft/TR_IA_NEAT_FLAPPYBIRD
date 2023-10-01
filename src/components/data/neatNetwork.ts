import { Guid } from "guid-typescript";
import { Network } from "neataptic";

export class NeatNetwork { 
    private id: Guid;
    private created: Date;
    private network: Network;

    constructor(network: Network){
        this.network = network;
        this.created = new Date();
        this.id = Guid.create();
    }   

    public getId(): Guid{
        return this.id;
    }
    public getCreated(): Date{
        return this.created;
    }
    public getNetwork(): Network{
        return this.network;
    }

}