import { colors, createSystem } from 'frog/ui'
 
export const {
  Box,
  Columns,
  Column,
  Heading,
  HStack,
  Rows,
  Row,
  Spacer,
  Text,
  Divider,
  VStack,
  Image,
  vars,
} = createSystem({
    colors: {
      text: '#000000',
      main: '#8b5cf6',
      background: '#ffffff',
      green: '#00ff00',
      white: '#ffffff',
      red: '#ff0000',
      orange: '#ffaa00',
      gray: "rgb(149 155 157)",
      blue: 'rgb(0 199 255)'
    }
})