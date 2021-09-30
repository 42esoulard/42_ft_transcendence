import { User } from "src/users/interfaces/user.interface";
import { FortyTwoUser } from "./42user.interface";

export interface AuthProvider {
  validateUser(user: FortyTwoUser): Promise<User>;
  login(user: any);
  createUser(userProfile: FortyTwoUser);
  findUserById();
}