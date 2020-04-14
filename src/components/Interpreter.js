export default class Interpreter  {

    translate(input) {
        console.log(input);
        if(LogoSendCommands[input]){
            console.log(LogoSendCommands[input]);
            return LogoSendCommands[input]
        } 
        if(input.match(/readADC/g))
        {
            console.log("conditional");
            return this.getReadADCCommand(input);
        }               
            return false;
        
    }

    getReadADCCommand(input){
        console.log("get read " + input);
        var inputArray = input.split(" ");
        console.log(inputArray);
        var command = "0xc" + inputArray[1];
        console.log(command);
        return command;
    }


}




var LogoSendCommands = {
    OB1on: 0xef,
    OB1off: 0xdf,
    dp2on: 0xe2,
    dp3on: 0xe3,
    dp3off: 0xd3,
    dp4on: 0xe4,
    dp4off: 0xd4,
    dp5on: 0xe5,
    dp5off: 0xd5,
    dp6on: 0xe6,
    dp6off: 0xd6,
    dp7on: 0xe7,
    dp7off: 0xd7,
    dp8on: 0xe8,
    dp8off: 0xd8,
    dp9on: 0xe9,
    dp9off: 0xd9    
}