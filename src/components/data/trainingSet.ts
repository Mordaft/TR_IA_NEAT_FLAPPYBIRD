export class TrainingSet { 
    
    private data: [
        {
            input: number[],
            output: number
        }
    ]        
    
    constructor(bodyResponse: any){
        this.data = bodyResponse;
    }
    
    getData(){  
        return this.data;
    }

}