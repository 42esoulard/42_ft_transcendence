import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
import { FortyTwoOauthGuard } from "./fortytwo.authgard";
import * as fs from 'fs';

@Controller('auth')
export class AuthController {
  @Get()
  @UseGuards(FortyTwoOauthGuard)
  // @Redirect('http://localhost:8080')
  async getUserFrom42Login(@Req() req: any) {
    console.log(req.query);
    //    const str = JSON.stringify(req);
    //     fs.writeFile("log_req", str, function(err) {
    //         if(err) {
    //             return console.log(err);
    //         }
    //         console.log("The file was saved!");
    //     }); 
    return req.query;
  }
}
