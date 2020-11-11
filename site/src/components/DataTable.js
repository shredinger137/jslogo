import React from 'react';
 
function DataTable(props) {
  return (
      <div style={{overflow: "scroll", height: "100%", width: "100%"}}>
          <table>
              <thead>
                  <tr>
                      <th>Time</th>
                      <th>ADC0</th>
                      <th>ADC1</th>
                      <th>ADC2</th>
                      <th>ADC3</th>
                      <th>ADC4</th>
                      <th>ADC5</th>
                  </tr>
              </thead>
              <tbody>
                  {props.tableData.map(dataLine => {
                      return ( 
                        <tr>
                            <td>{dataLine[0]}</td>
                            <td>{dataLine[1]}</td>
                            <td>{dataLine[2]}</td>
                            <td>{dataLine[3]}</td>
                            <td>{dataLine[4]}</td>
                            <td>{dataLine[5]}</td>
                            <td>{dataLine[6]}</td>
                        </tr>
                        )
                     
                  } )}
              </tbody>
          </table>
      </div>
  )
}
 
export default DataTable;