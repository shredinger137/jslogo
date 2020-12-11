import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import { Scatter } from 'react-chartjs-2'

export default class Chart extends Component {

    state = {
        options: {}
    }
    
    chartRef = {}

    buildOptions(){
        
    }

    componentDidUpdate(){
        console.log(this.props.chartDataSingle);
    }

    render() {
        return (
            <div style={{ height: "100%", width: "100%" }}>
                {this.props.chartType == "single" ?
                    <Scatter
                        data={{
                            datasets:
                                [
                                    {
                                        data: this.props.chartDataSingle
                                    }

                                ]
                        }}


                        options={{
                            scales: {
                                yAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: this.props.chartOptionsSingle.yLabel
                                    },
                                    ticks: this.props.chartOptionsSingle.ticks
                                }],
                                xAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: this.props.chartOptionsSingle.xLabel
                                    }
                                }]
                            },
                            legend: {
                                display: false
                            },
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

                    this.props.chartType == "double" ?
                        <>
                        <div style={{ height: "50%" }}>
                            <Scatter
                                data={{
                                    datasets:
                                        [
                                            {
                                                label: "",
                                                data: this.props.chartDataTop
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