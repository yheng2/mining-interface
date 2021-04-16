import React, { useEffect, useState, useCallback } from 'react'

import styled from 'styled-components'
import { useWallet } from 'use-wallet'

import metamaskLogo from '../../assets/img/metamask-fox.svg'
import newLogo from '../../assets/img/metamask.da7f0b29.png'
import walletConnectLogo from '../../assets/img/wallet-connect.svg'
import { makeStyles, withStyles} from '@material-ui/core/styles';

import Button from '../Button'
import CustomInput from '../CustomInput'
import Modal, { ModalProps } from '../Modal'
import ModalActions from '../ModalActions'
import ModalContent from '../ModalContent'
import ModalTitle from '../ModalTitle'
import Spacer from '../Spacer'
import { useTranslation } from 'react-i18next'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';



const TokenSelectProviderModel: React.FC<ModalProps> = ({ onDismiss, dataSelect}) => {
    const { account, connect } = useWallet()
    const { t } = useTranslation()

    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);

    const handleChangePage = (name: any, newPage: any) => {
        setPage(newPage);
    };

    const selectRow = (name: any) => {
        dataSelect(name)
        onDismiss()
    }

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(parseInt(event.target.value, 25));
        setPage(0);
    };

    /// Farm Name
    const [keyword, setKeyword] = useState('')
    const handleKeyword = useCallback(
        (e: React.FormEvent<HTMLInputElement>) => {
            setKeyword(e.currentTarget.value)
        },
        [setKeyword],
    )

    
    const useStyles = makeStyles({
        root: {
            color: '#647684',
            textTransform: 'none',
            minWidth: 72,
            fontWeight: 700,
            marginRight: 20,
            fontSize: 20,
            '&:hover': {
              color: '#555A6A',
              opacity: 1,
            },
            '&$selected': {
              color: '#555A6A',
              fontWeight: 700,
            },
            '&:focus': {
              color: '#555A6A',
            },
            
        },
        table: {
        // minWidth: {window.innerWidth - 48},
        // minWidth: 300
        },
        indicator: {
            display: "none",
        }
    
    });
    const classes = useStyles();
   
    const tokenList = [{name: "MCT-NEW"}, {name: "NUST-NEW"}, {name: "MZD-NEW"}, {name: "IMX-NEW"}]

    // const [dataFilled, setDataFilled] = useState(false)
    useEffect(() => {
    }, [account, onDismiss])

    return (
        <Modal>
            <div>
                <ModalTitle text={'请选择一个流动性通证'} />
                <StyledLabel>
                    <Button text={t('Cancel')} variant="normal" size="normal" onClick={onDismiss} />
                </StyledLabel>
            </div>
            <StyledWalletCard>
                <StyledInputDiv>
                    <StyledInput onChange={handleKeyword} placeholder={'搜索流动性通证名称'}></StyledInput>
                </StyledInputDiv>
                <StyledTableContainer> 
                    <StyledTableHeader>
                        通证地址
                    </StyledTableHeader>
                    <Line />

                    <Table className={classes.table} aria-label="simple table">
                        <TableBody>
                            {   
                                tokenList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((farm, j) => {
                        
                                    return (
                                        <StyledTableRow key={j} onClick={(e) => selectRow(farm.name)}>
                                            <StyledTD>
                                            <StyledIconDiv> 
                                                <StyledRightIcon>

                                                </StyledRightIcon>
                                                <StyledLeftIcon>

                                                </StyledLeftIcon>
                                            </StyledIconDiv>

                                            <StyledLPNameDiv>{farm.name}</StyledLPNameDiv>
                                            </StyledTD>
                                        </StyledTableRow>
                                    )
                                })
                            }
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[25]}
                        component="div"
                        count={tokenList.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                    />
            
                </StyledTableContainer>
            {/* <StyledTable>

            </StyledTable> */}
        </StyledWalletCard>
    </Modal>
  )
}

const StyledWalletsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    flex-direction: column;
    flex-wrap: none;
  }
  max-height: 80%;
//   overflow: auto;
`

const StyledWalletCard = styled.div`
  // flex-basis: calc(50% - ${(props) => props.theme.spacing[2]}px);
  flex-basis: calc(100%);

`
const StyledTD = styled.td`
  width: 100%;
  display: flex;
`

const StyledLabel = styled.div`
  float: right;
  margin-top: -44px;
`

const StyledTip = styled.div`
  width: 100%;
  color: #647684;
  font-size: 13px;
  font-weight: 300;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
`

const StyledInputDiv = styled.div`
  height: 50px;
  width: 100%;
  padding: 0px;
  border: 1px solid #00C99E;
  border-radius: 16px;
`

const StyledInput = styled.input`
  width: calc(100% - 16px);
  border: none;
  height: 50px;
  border-radius: 16px;
  padding: 0px;
  margin-left: 8px;
  &:focus{
      outline: none;
  }
`

const StyledTable = styled.div`
    height: 200px;
    width: 100%;
    background: red;
    margin-bottom: 20px;
`

const StyledTableRow = withStyles((theme) => ({
    root: {
      // '&:nth-of-type(odd)': {
      //   backgroundColor: theme.palette.action.hover,
      // },
      display: 'flex',
      flexDirection: 'row',
      height: '64px',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      // '&:hover': {
      //   background-color: red,
      // },
    },
}))(TableRow);

const StyledTableCell = withStyles((theme) => ({
    head: {
      borderBottom: "1px solid #F8F8F8",
    },
    body: {
      borderBottom: "1px solid #F8F8F8"
    },
    root: {
       paddingLeft: "0px",
       paddingRight: "0px"
    }

}))(TableCell);

 
const StyledTableContainer = withStyles((theme) => ({
    root: {
      boxShadow: "0 #fff",
      marginTop: "10px",
    }
}))(TableContainer);

const StyledTableHeader = styled.div`
    padding-top: 10px;
    padding-bottom: 10px;
    height: 32px;
    width: 100%;
    color: #647684;
    font-size: 14px;
`

const Line = styled.div`
    background: #F2F2F7;
    height: 1px;
    width: 100%;
`

const StyledIconDiv = styled.div`
    height: 25px;
    margin-top: 16px;
    width: 40px;
    margin-left: 4px;
`

const StyledLeftIcon = styled.img`
    height: 25px;
    width: 25px;
    background: green;
    float: left;
    margin-top: -25px;
    border-radius: 12.5px;
`

const StyledRightIcon = styled.img`
    height: 25px;
    width: 25px;
    background: yellow;
    float: right;
    border-radius: 12.5px;
`

const StyledLPNameDiv = styled. div`
    height: 32px;
    margin-left: 4px;
    margin-top: 16px;
`

export default TokenSelectProviderModel
