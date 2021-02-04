export const includes = 
`
to receive-packet
  make "_data []
  push "_data now
  push "_data read0
  push "_data read1
  push "_data read2
  push "_data read3
  push "_data read4
  push "_data read5
  output :_data
end


`;
