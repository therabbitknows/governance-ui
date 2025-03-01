import { findMetadataPda } from '@metaplex-foundation/js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import useWalletStore from 'stores/useWalletStore'

const OneHMs = 3600000

export const useTokenMetadataKeys = {
  byMint: (k: PublicKey) => [k.toString()],
}

export const useTokenMetadata = (
  mint: PublicKey | undefined,
  enableConditions = true
) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = !!mint && !!enableConditions

  const query = useQuery({
    queryKey: enabled ? useTokenMetadataKeys.byMint(mint) : undefined,
    queryFn: async () => {
      const mintPubkey = new PublicKey(mint!)
      const metadataAccount = findMetadataPda(mintPubkey)
      const metadata = await Metadata.fromAccountAddress(
        connection.current,
        metadataAccount
      )
      //Do not use data.img we don't want to have unsafe imgs to show in realms.
      return {
        symbol: metadata.data.symbol,
        name: metadata.data.name,
      }
    },
    staleTime: OneHMs,
    cacheTime: OneHMs * 24 * 10,
    enabled,
  })

  return query
}
