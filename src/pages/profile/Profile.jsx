import React, {useEffect, useState} from 'react';
import './profile.css'
import Nfts from '../../components/nfts/Nfts'
import {useContractKit} from "@celo-tools/use-contractkit";
import {useMarketContract} from "../../hooks/useMarketContract";
import axios from "axios";
import {ethers} from "ethers";

const Profile = () => {

    const {address, connect, performActions} = useContractKit()
    const marketplace = useMarketContract()


    const [nfts, setNfts] = useState([]);
    const [soldNfts, setSoldNfts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (marketplace) {
            loadNFTs()
        }
    }, [ marketplace]);

    const loadNFTs = async () => {
        setLoading(true)
        try {
            const data = await marketplace.methods.fetchMyNFTs().call()
            console.log({data})
            const items = await Promise.all(data.map(async i => {
                const tokenURI = await marketplace.methods.tokenURI(i.tokenId).call()

                const owner = await marketplace.methods.getNftOwner(i.tokenId).call()
                const meta = await axios.get(tokenURI)
                let price = ethers.utils.formatUnits(i.price.toString(), 'ether')

                return {
                    price,
                    tokenId: Number(i.tokenId),
                    seller: i.seller,
                    name: meta.data.name,
                    owner,
                    image: meta.data.image,
                    tokenURI
                }
            }))

            setNfts(items)
        } catch (e) {
            console.log({e})
        } finally {
            setLoading(false)
        }


    }


    return (
        <div className='profile section__padding'>
            <div className="profile-top">
               
            </div>
            <div className="profile-bottom">
     
                <Nfts nfts={nfts} loading={loading} title="Your NFTs" relist={true}/>
            </div>
        </div>
    );
};

export default Profile;
