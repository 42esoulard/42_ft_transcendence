import { User } from "src/users/interfaces/user.interface";
import { FortyTwoUser } from "./42user.interface";

export interface AuthProvider {
  validateUser(user: FortyTwoUser): Promise<User>;
  createUser(userProfile: FortyTwoUser);
  findUserById();
}