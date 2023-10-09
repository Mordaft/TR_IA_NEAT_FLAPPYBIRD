import { Neat, Network, architect, methods } from "neataptic";

export const MUTATION_RATE: number = 25;
export const START_HIDDEN_SIZE: number = 4;
export const INPUTS_SIZE: number = 3;
export const OUTPUTS_SIZE: number = 1;
export const ELITISM_PERCENT: number = 0.10;
export const INTERATIONS: number = 1500;
export const ERROR_TARGET: number = 0.15;

export class Brain {

    private brain!: Neat;
    private generation!: number;
    private fitnessFunction: any;
    private birdAmount: number;
    private network!: Network;

    /**
     * Creates a new instance of the Brain class.
     * @constructor
     * @param {any} fitnessFunction - The fitness function to be used for the neural network.
     * @param {number} birdAmount - The number of birds to be used for the neural network.
     */
    constructor(fitnessFunction: any, birdAmount: number) {
        this.fitnessFunction = fitnessFunction;
        this.birdAmount = birdAmount;
        //Variaciones probadas de redes neuronales..
        //let network: Network = architect.Random( INPUTS_SIZE, START_HIDDEN_SIZE, OUTPUTS_SIZE , null)
        this.network = architect.Perceptron(INPUTS_SIZE, START_HIDDEN_SIZE, OUTPUTS_SIZE);

        fetch('/trainingSet/data.json').then(response => {
            response.json().then(data => {
                // console.log(data);
                // let traindata = data;
                this.network.evolve(data, {
                    mutation: methods.mutation.ALL,
                    equal: true,
                    popsize: this.birdAmount,
                    elitism: ELITISM_PERCENT * 100,
                    log: INTERATIONS / 10,
                    error: ERROR_TARGET,
                    iterations: INTERATIONS,
                    mutationRate: MUTATION_RATE / 100
                }).then((result: any) => {
                        console.info('Evolved!', result);
                        this.createBrain();
                        this.generation = 1;

                    }).catch((err: any) => {
                        console.error(err);
                        // reintento en caso de no funcionar bien la libreria (ha ocurrido muy pocas veces)
                        this.createBrain(); 
                        this.generation = 1;
                    });

            }).catch(err => {
                console.error(err);
                // reintento en caso de no funcionar bien la libreria (ha ocurrido muy pocas veces)
                this.createBrain(); 
                this.generation = 1;
                
            });
        });
    }

    /**
     * Creates a new NEAT brain with the specified inputs and outputs sizes, fitness function, and mutation options.
     * @returns void
     */
    createBrain() {
        this.brain = new Neat(INPUTS_SIZE, OUTPUTS_SIZE, this.fitnessFunction, {
            mutation: [
                // methods.mutation.ADD_NODE,
                // methods.mutation.SUB_NODE,
                // methods.mutation.ADD_CONN,
                // methods.mutation.SUB_CONN,
                methods.mutation.MOD_WEIGHT,
                methods.mutation.MOD_BIAS,
                methods.mutation.MOD_ACTIVATION,
                // methods.mutation.ADD_GATE,
                // methods.mutation.SUB_GATE,
                // methods.mutation.ADD_SELF_CONN,
                // methods.mutation.SUB_SELF_CONN,
                // methods.mutation.ADD_BACK_CONN,
                // methods.mutation.SUB_BACK_CONN
            ],
            popsize: this.birdAmount,
            mutationRate: MUTATION_RATE,
            elitism: Math.round(ELITISM_PERCENT * this.birdAmount),
            network: this.network,
            equal: true
        });

    }
    

    /**
     * Creates a new population of bird genomes for the next generation.
     * The new population is created by selecting the top performing genomes
     * from the current population (based on their fitness score) and breeding
     * them to produce offspring genomes. The remaining genomes in the new
     * population are randomly generated through mutation.
     */
    createPopulation() {
        //  Evolution equivalent to brain.evolve(); but this isn't have errors...  --->
        this.brain.sort();
        // console.info('createPopulation: average score:', this.brain.getAverage());
        //Evolution equivalent to brain.evolve(); but this isn't have errors... -->
        // console.info('createPopulation: sorted last population', this.brain.population);
        let newPopulation = [];
        for (var i: number = 0; i < Math.abs(this.birdAmount * ELITISM_PERCENT); i++) {
            let genome = this.brain.population[i];
            newPopulation.push(genome);
        }
        for (var i: number = 0; i < (this.birdAmount - Math.abs(this.birdAmount * ELITISM_PERCENT)); i++) {
            let genome = this.brain.getOffspring();
            newPopulation.push(genome);
        }
        this.brain.population = newPopulation;
        //Evolution equivalent to brain.evolve(); but this isn't have errors...  <---
        this.brain.mutate();
        // console.info('createPopulation: mutated population', this.brain.population);
        this.generation++;
    }

    /**
     * Returns the generation number of the current brain.
     * @returns The generation number of the current brain.
     */
    getGeneration(): number {
        return this.generation;
    }

    /**
     * Returns the population of neural networks created by the brain.
     * @returns An array of neural networks.
     */
    getPopulation(): Network[] {
        this.createPopulation();
        return this.brain.population;
    }

    /**
     * Returns the graph of the neural network at the specified index in the population.
     * If the index is negative, returns the graph of the first neural network in the population.
     * @param index The index of the neural network in the population.
     * @returns The graph of the specified neural network.
     */
    getGraph(index: number) {
        if (index >= 0) {
            return this.brain.population[index].graph(400, 600);
        }
        else return this.brain.population[0].graph(400, 600);
    }

}