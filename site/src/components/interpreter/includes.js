export const includes = 
`
    to receive-packet
        
        make "_last-packet []
        make "_last-packet se :_last-packet unixtime
        make "_last-packet se :_last-packet readADC0
        make "_last-packet se :_last-packet readADC1
        make "_last-packet se :_last-packet readADC2
        make "_last-packet se :_last-packet readADC3
        make "_last-packet se :_last-packet readADC4
        make "_last-packet se :_last-packet readADC5

    end


`;
