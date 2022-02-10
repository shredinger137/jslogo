export const includes = 
`
    to receive-packet
        if (is-defined '_packet-length') = false
        [
            make '_packet-length' 6
        ]

        make '_checksum' 0

        make '_packet-type' 'T1'
        ;always T1 right now because these aren't defined yet

        let "i 0
        make '_last-packet' :_packet-type
        make "_last-packet se :_last-packet now

        repeat ( :_packet-length ) [
            let "_adc-holder readADC :i
            make "_last-packet se :_last-packet ( :_adc-holder )
            let 'i' :i + 1
            make "_checksum :_checksum + (:_adc-holder)
        ]

        make "_last-packet se :_last-packet :_checksum

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

    to set-packet-save :value
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
