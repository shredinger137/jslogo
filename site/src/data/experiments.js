import blank from '../experiments/Blank.logo';
import leds from '../experiments/LEDs.logo';
import packets from '../experiments/Packets.logo';
import plottingDemo from '../experiments/PlottingDemo.logo';
import sensors from '../experiments/Sensors.logo';
import turtleLogo from '../experiments/TurtleLogo.logo';
import waterSoil from '../experiments/WaterSoil.logo';
import evaporation from '../experiments/Evaporation.logo';

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
    }
];

