export const experimentsList = [
    {
        name: "Blank Project",
        code: ``
    },
    {
        name: "Evaporation",
        code: 
`to go
   print "Evaporation
end`
    },
    {
        name: "Absorption",
        code: 
`to go
   print "Absorption
end`
    },
    {
        name: "LEDs",
        fileLocation: "/experiments/LEDs.logo",
        code: 
`to a-on
   dp2on ;enter a comment that describes the function of this word
end

to a-off
   dp2off ;enter a comment that describes the function of this word
end

to b-on
   dp3on ;enter a comment that describes the function of this word
end

to b-off
   dp3off ;enter a comment that describes the function of this word
end

to c-on
   ;dp4on
end

to c-off
;	dp4off
end

to d-on
   ;enter code to turn LED d on
end
`
    }
];


//This is temporary. Next we need to change the structure so that each experiments gets a text file in the experiments folder. Or we add a file to the public area and pull from that.