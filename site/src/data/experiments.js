import blank from '../experiments/Blank.logo';
import leds from '../experiments/LEDs.logo';
import packets from '../experiments/Packets.logo';
import plottingDemo from '../experiments/PlottingDemo.logo';
import sensors from '../experiments/Sensors.logo';
import turtleLogo from '../experiments/TurtleLogo.logo';
import waterSoil from '../experiments/WaterSoil.logo';
import evaporation from '../experiments/Evaporation.logo';
import MFC from '../experiments/MFC.logo';
import LightAndEnergy from '../experiments/LightAndEnergyNew.logo';

export const experimentsList = [
    {
        name: "Blank",
        code: blank
    },

    {
        name: "LEDs",
        code: leds
    },

    {
       name: "Sensors",
       code: sensors
    },

    {
        name: "Plotting Demo",
        code: plottingDemo
     },
     {
        name: "TurtleLogo",
        code: turtleLogo
    },
    {
        name: "Packets",
        code: packets
    },
    {
        name: "Temperatures",
        code: evaporation

    },
    {
        name: "Water Soil",
        code: waterSoil
    },
    {
        name: 'Fuel Cell',
        code: MFC
    },
    {
        name: 'Light and Energy',
        code: LightAndEnergy
    }
];

