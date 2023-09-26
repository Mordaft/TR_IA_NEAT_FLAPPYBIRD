import { Neat, Network, architect, methods } from "neataptic";

export const BIRD_AMOUNT: number = 10;
export const MUTATION_RATE: number = 0.4;
export const START_HIDDEN_SIZE: number = 4;
export const INPUTS_SIZE: number = 3;
export const OUTPUTS_SIZE: number = 1;
export const ELITISM_PERCENT: number = 0.2;


export class Brain {

    private brain: Neat;
    private generation: number;
    private fitnessFunction: any;

    constructor(fitnessFunction: any) {
       
        this.fitnessFunction = fitnessFunction;
        //Variaciones probadas de redes neuronales..
        //let network: Network = architect.Random( INPUTS_SIZE, START_HIDDEN_SIZE, OUTPUTS_SIZE , null)
        let network: Network = architect.Perceptron(INPUTS_SIZE, START_HIDDEN_SIZE, OUTPUTS_SIZE);

        this.brain = new Neat(INPUTS_SIZE, OUTPUTS_SIZE, this.fitnessFunction, {
            mutation: [
                methods.mutation.ADD_NODE,
                methods.mutation.SUB_NODE,
                methods.mutation.ADD_CONN,
                methods.mutation.SUB_CONN,
                methods.mutation.MOD_WEIGHT,
                methods.mutation.MOD_BIAS,
                methods.mutation.MOD_ACTIVATION,
                methods.mutation.ADD_GATE,
                methods.mutation.SUB_GATE,
                methods.mutation.ADD_SELF_CONN,
                methods.mutation.SUB_SELF_CONN,
                methods.mutation.ADD_BACK_CONN,
                methods.mutation.SUB_BACK_CONN
            ],
            popsize: BIRD_AMOUNT,
            mutationRate: MUTATION_RATE,
            elitism: Math.round(ELITISM_PERCENT * BIRD_AMOUNT),
            network: network,
            equal: true
        }
        );

        this.generation = 1;
    }


    createPopulation(){
        console.info('createPopulation', this.brain.population);
        this.brain.sort();
        //Evolution equivalent to brain.evolve(); but this isn't have errors... -->
    
        let newPopulation = [];
        for (var i:number=0; i < Math.abs(BIRD_AMOUNT * ELITISM_PERCENT) ; i++){
          let genome = this.brain.population[i]; 
          newPopulation.push(genome); 
        }
        for (var i:number=0; i < (BIRD_AMOUNT - Math.abs(BIRD_AMOUNT * ELITISM_PERCENT)) ; i++){
          let genome = this.brain.getOffspring();
          newPopulation.push(genome); 
        }
        this.brain.population = newPopulation;
    
        //Evolution equivalent to brain.evolve(); but this isn't have errors...  <---
        this.brain.mutate();
        this.generation++;    
    
    }

    getGeneration():number{
        return this.generation;
    }

    getPopulation():Network[] {
        return this.brain.population;
    }
    
    getGraph(index: number){
        return this.brain.population[index].graph(400, 600);
    }

}