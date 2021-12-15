/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */

import React, { useRef } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import { Scatter } from 'react-chartjs-2'

function Chart(props) {

    const chartRefSingle = useRef(null);
    const chartRefTop = useRef(null);
    const chartRefBottom = useRef(null);


    //TODO: Set this to take an argument for the ref, then download an image for the appropriate chart. Add text or a button to save.
    const downloadSingle = () => {
        if (chartRefSingle && chartRefSingle.current && chartRefSingle.current.chartInstance) {
            const base64image = chartRefSingle.current.chartInstance.toBase64Image();
            let filename = 'chart.png';
            var a = document.createElement('a');
            a.href = base64image;
            a.download = filename;
            a.click();
        }

    }

    return (
        <div style={{ height: "100%", width: "100%" }}>
            {props.chartType == "single" ?
                <>
                    <p onClick={() => {downloadSingle()}}  style={{ fontSize: '.8rem', padding: 0, margin: 0, position: 'absolute', top: '5px', left: '5px' }}>Download chart</p>
                    <Scatter
                        data={{
                            datasets:
                                [
                                    {
                                        data: props.chartDataSingle
                                    }

                                ]
                        }}


                        options={props.chartOptionsSingle}
                        redraw={true}
                        ref={chartRefSingle
                        }
                    />
                </>
                :

                props.chartType == "double" ?
                    <>

                        <div style={{ height: "50%" }}>
                            <Scatter
                                data={{
                                    datasets:
                                        [
                                            {
                                                data: props.chartDataTop
                                            }

                                        ]
                                }}


                                options={
                                    props.chartOptionsTop}
                                redraw={true}
                                ref={chartRefTop}
                            />
                        </div>

                        <div style={{ height: "50%" }}>
                            <Scatter
                                data={{
                                    datasets:
                                        [
                                            {
                                                data: props.chartDataBottom
                                            }

                                        ]
                                }}


                                options={props.chartOptionsBottom}
                                redraw={true}
                                ref={chartRefBottom}
                            />
                        </div>
                    </>

                    : null

            }

        </div>
    )

}

export default Chart;