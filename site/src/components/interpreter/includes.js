export const includes = 
`
    to receive-packet

        if (is-defined '_packet-length') = false
        [
            make '_packet-length' 6
        ]

        let "i 0
        make '_last-packet' []
        make "_last-packet se :_last-packet now

        repeat :_packet-length [
            make "_last-packet se :_last-packet ( readADC :i )
            let 'i' :i + 1
        ]

        if (is-defined '_packet-log') = false 
        [
            make '_packet-log' false
        ]

        if (:_packet-log = true)[
            logData :_last-packet
        ]


    end

    to set-packet-count :n
        make '_packet-length' :n
    end

    to set-packet-log :value
        make '_packet-log' :value
    end

    to readLightSensor
        output readADC2
    end

    to readTempSensor0
        output readADC0
    end

    to readTempSensor1
        output readADC1
    end

    to showxy
        print tcor
    end




`;
