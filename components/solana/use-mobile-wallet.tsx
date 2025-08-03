import { SignInPayload } from '@solana-mobile/mobile-wallet-adapter-protocol'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import { Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js'
import { useCallback, useMemo } from 'react'
import { Account, useAuthorization } from './use-authorization'

export function useMobileWallet() {
  const { authorizeSessionWithSignIn, authorizeSession, deauthorizeSessions } = useAuthorization()

  const connect = useCallback(async (): Promise<Account> => {
    return await transact(async (wallet) => {
      return await authorizeSession(wallet)
    })
  }, [authorizeSession])

  const signIn = useCallback(
    async (signInPayload: SignInPayload): Promise<Account> => {
      return await transact(async (wallet) => {
        return await authorizeSessionWithSignIn(wallet, signInPayload)
      })
    },
    [authorizeSessionWithSignIn],
  )

  const disconnect = useCallback(async (): Promise<void> => {
    await deauthorizeSessions()
  }, [deauthorizeSessions])

  const signAndSendTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction, minContextSlot: number): Promise<TransactionSignature> => {
      console.log('Mobile wallet: Starting transaction signing', {
        transactionType: transaction.constructor.name,
        minContextSlot,
        transactionSize: transaction.serialize().length,
      })
      
      return await transact(async (wallet) => {
        console.log('Mobile wallet: Authorizing session...')
        await authorizeSession(wallet)
        console.log('Mobile wallet: Session authorized, signing transaction...')
        
        const signatures = await wallet.signAndSendTransactions({
          transactions: [transaction],
          minContextSlot,
        })
        
        console.log('Mobile wallet: Transaction signed successfully', signatures[0])
        return signatures[0]
      })
    },
    [authorizeSession],
  )

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      return await transact(async (wallet) => {
        const authResult = await authorizeSession(wallet)
        const signedMessages = await wallet.signMessages({
          addresses: [authResult.address],
          payloads: [message],
        })
        return signedMessages[0]
      })
    },
    [authorizeSession],
  )

  return useMemo(
    () => ({
      connect,
      signIn,
      disconnect,
      signAndSendTransaction,
      signMessage,
    }),
    [connect, disconnect, signAndSendTransaction, signIn, signMessage],
  )
}
