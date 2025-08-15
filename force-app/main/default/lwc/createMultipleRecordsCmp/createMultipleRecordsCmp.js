import { LightningElement,track } from 'lwc';
import getPickListValueLWC from '@salesforce/apex/PicklistValuesLightningController.getPickListValueLWC';

export default class CreateMultipleRecordsCmp extends LightningElement {
    @track contacts = [];
    rowCount = 0;
    @track comboboxOptions={LeadSource:[]};

    connectedCallback(){
        this.addRow();
        this.fetchPicklistValues();
    }

    fetchPicklistValues(){
        const picklistFields = ['LeadSource']
        getPickListValueLWC({objectAPIName:'Contact',fieldAPINames:picklistFields})
        .then(result=>{
            this.comboboxOptions.LeadSource = result.LeadSource.map(p=>({label:p,value:p}));
            console.log(this.comboboxOptions.LeadSource);
        })
        .catch(error=>{
            console.log(error);
        })
    }

    addRow(){
        const contact  = {RowId:++this.rowCount,FirstName:'',LastName:'',OwnerId:'',Email:'',Phone:'',LeadSource:''};
        //this.contacts = [...this.contacts,contact];
        this.contacts.push(contact);
    }

    handleInpChange(event){
        const RowId = event.target.dataset.row;
        const Field = event.target.name;
        console.log(RowId,Field);
        this.contacts.forEach(contact => {
            if (contact.RowId == RowId) {
                //return { ...contact, [Field]: event.target.value };
                contact[Field] = event.target.value;
            }
            //return contact;
        });
    }

    removeRow(event){
        const RowId = event.target.dataset.row;
        this.contacts = this.contacts.filter(c=>c.RowId!=RowId);
    }

    handleLookupSelection(event){
        const { index, value,fieldname } = event.detail;
        console.log(index,value);
        this.contacts.forEach(contact => {
            if (contact.RowId == index) {
                //return { ...contact, [Field]: event.target.value };
                contact[fieldname] = value;
            }
            //return contact;
        });
    }

    save(){
        const rowsToSave = [];
        this.contacts.forEach(contact=>{
            const{RowId,...updatedContact} = contact;
            rowsToSave.push(updatedContact);
        })
        console.log("Rows to Save",JSON.stringify(rowsToSave));
    }

    reset(){
        this.contacts = [];
        this.rowCount = 0;
        this.addRow();
    }
}