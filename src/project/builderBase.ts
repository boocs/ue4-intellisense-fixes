
export type IsValid = boolean;


export abstract class ValidatedBuilderBase
{

    private _isValid: boolean;
    
    constructor(){
        this._isValid = false;
    }

    get isValid(): boolean {
        return this._isValid;
    }

    set isValid(value: boolean) {
        this._isValid = value;
    }

    protected basePostConstructionSetup(): IsValid {
        return true;
    }

}
