import { RNG, u128 } from "near-sdk-as";

@nearBindgen
export class Project{
  id:i32;
  name: string; 
  address: string;
  description: string;
  funds: u128;
  recieved:u128;
  residual:u128;

  constructor(name: string, address: string, funds: u128, description: string){
      const rng = new RNG<u32>(1, u32.MAX_VALUE);
      const role = rng.next();
    this.id= role;
    this.address = address;
    this.name= name;
    this.description = description;
    this.funds=funds;
    this.recieved = u128.Zero;
    this.residual= u128.Zero;
  }

}