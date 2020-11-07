export const includes = 
`to box 
    fd 50
    rt 90
    fd 50
    rt 90
    fd 50   
    rt 90
    fd 50
end


to readData
  make "data now
  make "data (se :data read0)
  make "data (se :data read1)
  make "data (se :data read2)
  make "data (se :data read3)
  make "data (se :data read4)
  make "data (se :data read5)
  print :data
end

`;
