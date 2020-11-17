import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import { Scatter } from 'react-chartjs-2'

export default class Chart extends Component {

    chartRef = {}


    render() {
        return (
            <div style={{ height: "100%", width: "100%" }}>
                {this.props.chartType == "Single Scatter" ?
                    <Scatter
                        data={{
                            datasets:
                                [
                                    {
                                        label: "Temp. vs Time",
                                        data: this.props.chartData
                                    }

                                ]
                        }}


                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: {
                                duration: 0
                            },
                            elements: {
                                point: {
                                    radius: 4,
                                    backgroundColor: "black"
                                }
                            }
                        }
                        }
                        redraw={true}
                        ref={this.chartReference}
                    />
                    :

                    this.props.chartType == "Double Scatter" ?
                        <>
                        <div style={{ height: "50%" }}>
                            <Scatter
                                data={{
                                    datasets:
                                        [
                                            {
                                                label: "Temp. vs Time",
                                                data: this.props.chartData
                                            }

                                        ]
                                }}


                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    animation: {
                                        duration: 0
                                    },
                                    elements: {
                                        point: {
                                            radius: 4,
                                            backgroundColor: "black"
                                        }
                                    }
                                }
                                }
                                redraw={true}
                                ref={this.chartReference}
                            />
                        </div>
                        
                         <div style={{ height: "50%" }}>
                         <Scatter
                             data={{
                                 datasets:
                                     [
                                         {
                                             label: "Temp. vs Time",
                                             data: this.props.chartData
                                         }

                                     ]
                             }}


                             options={{
                                 responsive: true,
                                 maintainAspectRatio: false,
                                 animation: {
                                     duration: 0
                                 },
                                 elements: {
                                     point: {
                                         radius: 4,
                                         backgroundColor: "black"
                                     }
                                 }
                             }
                             }
                             redraw={true}
                             ref={this.chartReference}
                         />
                     </div>
                     </>

                        : null

                }

            </div>
        )
    }

}   