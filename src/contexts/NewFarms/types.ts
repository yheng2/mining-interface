import { Contract } from 'web3-eth-contract'

export interface NewFarm {
  pid: number
  name: string
  lpToken: string
  lpTokenAddress: string
  lpContract: Contract
  tokenAddress: string
  earnToken: string
  icon: string//React.ReactNode
  id: string
  tokenSymbol: string
  iconL: string
  iconR: string
}

export interface NewFarmsContext {
  newFarms: NewFarm[]
  unharvested: number
}
