import { LightningElement, api, track } from 'lwc';
import searchRecords from '@salesforce/apex/LookupController.searchRecords';

export default class CustomLookup extends LightningElement {
    @api objectApiName; // e.g., "User"
    @api index; // Row index from parent
    @api fields;
    @api additionalFilter;
    @api searchableField;
    @api fieldName;
    @track searchResults = [];
    @track selectedRecord;
    searchTerm = '';
    showDropdown = false;

    handleInputChange(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm.length >= 3) {
            const query = `SELECT ${this.fields} FROM ${this.objectApiName} WHERE ${this.searchableField} LIKE '%${this.searchTerm}%' ${this.additionalFilter}`;
            console.log(query);
            searchRecords({q:query})
                .then(data => {
                    if(data.length>0){
                        const nameField = this.getUpdatedName(data[0]);
                        if(nameField){
                        this.searchResults = data.map(d=>({...d,Name:d[nameField]})); 
                        }
                        else{
                            this.searchResults = data;
                        }
                        this.showDropdown = true;
                    }
                    else{
                        this.searchResults = [];
                        this.showDropdown = false;
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        } 
        else {
            this.searchResults = [];
            this.showDropdown = false;
        }
    }

    getUpdatedName(obj){
        const keys = Object.keys(obj);
        if(!keys.includes('Name')){
            return keys.find(key=>key!== 'Id');
        }
        else{
            return null;
        }
    }

    handleSelect(event) {
        const recordId = event.currentTarget.dataset.id;
        const recordName = event.currentTarget.dataset.name;

        this.selectedRecord = recordName;
        this.showDropdown = false;

        // Send data to parent
        this.dispatchEvent(new CustomEvent('lookupselected', {
            detail: { index: this.index, value: recordId, fieldname:this.fieldName }
        }));
    }

    handleClear() {
        this.selectedRecord = null;
        this.dispatchEvent(new CustomEvent('lookupselected', {
            detail: { index: this.index, value: '' }
        }));
    }
}
