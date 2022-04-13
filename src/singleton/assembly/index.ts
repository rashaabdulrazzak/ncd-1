import { storage, Context, PersistentMap, PersistentVector, u128, logging, ContractPromiseBatch } from "near-sdk-core"
import { Project } from "./model"

@nearBindgen
export class Contract {
  projects:PersistentMap<u32, Project>  = new PersistentMap<u32,Project>('p');
  projectIdList:PersistentVector<u32> = new PersistentVector<u32>('pl');
 
  @mutateState()
  // creat project
  createProject(address: string, name: string, funds: string, description: string):u32{
    const funds_u128 = u128.from(funds);

    const newProject = new Project(name, address, funds_u128, description);
    this.projects.set(newProject.id,newProject);
    this.projectIdList.push(newProject.id);
    logging.log('New project has been created with id : '+ (newProject.id).toString());
    return newProject.id;
  }
  
  // get project by id
  getProjectById(id:u32):Project{
    return this.projects.getSome(id);    
  }

  // get all projects
  getProjects():Array<Project>{
    const projectsResult= new Array<Project>();  
    const projectLen = this.projectIdList.length;  
    for (let i = 0; i < projectLen; i++) {
      logging.log("Project Id : " + (this.projectIdList[i]).toString());

      projectsResult.push(this.projects.getSome(this.projectIdList[i]))
    }
    return projectsResult
  }

  // update funds of a project
  updateFundOfProject(id:u32, funds: string):Project{
    const project = this.projects.getSome(id);
    const income = u128.from(funds);
    const income2 = u128.fromString(funds,10);
    const income3 = u128.fromString(funds);

   //  1. the project still need fund
   // 2. if the project get the needed fund
   if (project.funds > income && project.residual !=  project.funds) {
    project.recieved = u128.add(project.recieved, income)
    project.residual = u128.sub(project.funds, project.recieved)
  }
  else {
    project.residual = u128.from(0);
    project.recieved = income;
    //const newFundedProject = storage.getPrimitive<i32>("fundedProject", 0) + 1;
    //storage.set<i32>("fundedProject", newFundedProject);
  }
  logging.log("Project Residual : " + (project.residual).toString());
  logging.log("Project income : " + (income).toString());
  logging.log("Project income2 : " + (income2).toString());
  logging.log("Project income3 : " + (income3).toString());

  // Update the existing project 
  this.projects.set(id, project);

  return project

  }

  // Transfer the money to the selected project 
  // account id is the address of the project 
   sendDonation(accountId: string): string {
    let currentSender = Context.sender;
    let amount = Context.attachedDeposit;

    logging.log("Sender : " + currentSender);
    logging.log("Attached Amount : " + (amount).toString());

    // Transfer the attached money to the selectd project 
    const to_beneficiary = ContractPromiseBatch.create(accountId);
    const amount_to_receive = amount;

    to_beneficiary.transfer(amount_to_receive);

    return "Donation done successfully";
  }

  // Donate for project 
  // it require update the funds of the exsisting project 
  // also transfer the money from the sender to the account of project o testnet 
  donateForProject(accountId: string, id: u32, funds: string): string {
    
    this.updateFundOfProject(id, funds);
    this.sendDonation(accountId);

    return "Donation done successfully";

  }

}
