import blank from '../experiments/Blank.logo';
import leds from '../experiments/LEDs.logo';
import packets from '../experiments/Packets.logo';
import plottingDemo from '../experiments/PlottingDemo.logo';
import sensors from '../experiments/Sensors.logo';
import turtleLogo from '../experiments/TurtleLogo.logo';
import waterSoil from '../experiments/WaterSoil.logo';
import evaporation from '../experiments/Evaporation.logo';
import MFC from '../experiments/MFC.logo';
import LightAndEnergy from '../experiments/LightAndEnergy.logo';

//there's a good chance 'fileLocation' is outdated now, but check the file loader to make sure it's gone from everywhere
//(including the experiment as an import instead of referencing the file means it gets included in the offline PWA)

export const experimentsList = [
    {
        name: "Blank",
        fileLocation: "/experiments/Blank.logo",
        code: blank
    },

    {
        name: "LEDs",
        fileLocation: "/experiments/LEDs.logo",
        code: leds
    },

    {
       name: "Sensors",
       fileLocation: "/experiments/Sensors.logo",
       code: sensors
    },

    {
        name: "Plotting Demo",
        fileLocation: "/experiments/PlottingDemo.logo",
        code: plottingDemo
     },
     {
        name: "TurtleLogo",
        fileLocation: "/experiments/TurtleLogo.logo",
        code: turtleLogo
    },
    {
        name: "Packets",
        fileLocation: "/experiments/Packets.logo",
        code: packets
    },
    {
        name: "Temperatures",
        fileLocation: "/experiments/Evaporation.logo",
        code: evaporation

    },
    {
        name: "Water Soil",
        fileLocation: "/experiments/WaterSoil.logo",
        code: waterSoil
    },
    {
        name: 'Fuel Cell',
        fileLocation: "/experiments/MFC.logo",
        code: MFC
    },
    {
        name: 'Light and Energy',
        fileLocation: "/experiments/LightAndEnergy.logo",
        code: LightAndEnergy
    }
];

