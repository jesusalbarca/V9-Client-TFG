import {PostRequestAsyncJson} from "./Shared/Web_Requests.js";


//todo : This should change to allow users to get the token once when they log in the first time.
// They should be able to refresh it as well
export async function getJWTtoken() {
    //Makes request to auth server to get a JWT

    const AuthResponse = await PostRequestAsyncJson("http://localhost:3000/api/v1/login", {
        username: "alreylz",
        password: "01241851"
    });
    console.log(AuthResponse);

    console.log(`IXCI JWT token ${AuthResponse.token}`)


    localStorage.setItem("ixci-jwt", AuthResponse.token);

    return AuthResponse.token;

}