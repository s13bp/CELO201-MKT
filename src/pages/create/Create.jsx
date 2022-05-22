import './create.css'
import {useEffect, useState} from "react";
import {create as ipfsHttpClient} from 'ipfs-http-client'
import {useMarketContract} from "../../hooks/useMarketContract";
import {ethers} from "ethers";

import CircleLoader from "react-spinners/ClipLoader";
import {useContractKit} from "@celo-tools/use-contractkit";
import { useNavigate } from "react-router-dom";

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
const Create = () => {
    const {address, connect, performActions} = useContractKit()
    const navigate = useNavigate();
    useEffect(() => {

        if (!address) {

            (async () => {
                await connect()
            })()

        }

    }, [address, connect])


    const [loading, setLoading] = useState(false)
    const [image, setImage] = useState('')
    const [price, setPrice] = useState(null)
    const [category, setCategory] = useState('Art')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const marketplace = useMarketContract()


    const uploadToIPFS = async (event) => {
        event.preventDefault()
        const file = event.target.files[0]
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file)
                console.log(result)
                setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
            } catch (error) {
                console.log("ipfs image upload error: ", error)
            }
        }
    }

    const isFormFiled = () => {
        return !(image === '' || price === null || category === '' || name === '' || description === '');
    }
    const createNFT = async (e) => {
        e.preventDefault()
        try {
            await performActions(async (kit) => {
                const {defaultAccount} = kit;

                if (!image || !price || !name || !description || !category) return

                setLoading(true)
                const result = await client.add(JSON.stringify({image, price, name, description, category, owner : address}))
                await mintThenList(result, defaultAccount)

            })

        } catch (error) {
            console.log("ipfs uri upload error: ", error)
        } finally {
            setLoading(false)
        }
    }
    const mintThenList = async (result, defaultAccount) => {
        const uri = `https://ipfs.infura.io/ipfs/${result.path}`


        const listingPrice = ethers.utils.parseEther(price.toString())


        // mint nft
        await marketplace.methods.createToken(uri,listingPrice ).send({
            from:defaultAccount
        })


        alert("Your nft is now ON THE BLOCK!")
        navigate(`/`);

    }

    return (
        <div className='create two section__padding'>
            <div className="create-container">
                <h1>Creations Wizard</h1>
                <p>Here you get to upload your own Schwifty NFT. Fill in the details below and click on the LFG button at the bottom of it all to upload your svhwifty work of art to the blockchain! </p>


                <form className='writeForm' autoComplete='off'>

                    <div className="formGroup">
                        <label>CHOOSE YOUR ART</label>
                        <input onChange={uploadToIPFS} type="file" className='custom-file-input'
                        />
                    </div>
                    <div className="formGroup">
                        <label>CHOOSE CATEGORY</label>
                        <select onChange={(e) => {
                            console.log(e.target.value)
                            setCategory(e.target.value)
                        }}>
                            <option>Collectibles</option>
                            <option>Art</option>
                            <option>Trading Card</option>

                        </select>
                    </div>
                    <div className="formGroup">
                        <label>NAME</label>
                        <input onChange={(e) => setName(e.target.value)} type="text" placeholder='Item Name'
                               autoFocus={true}/>
                    </div>
                    <div className="formGroup">
                        <label>SOME BRIEF INFO</label>
                        <textarea onChange={(e) => setDescription(e.target.value)} rows={4}
    placeholder='Brief Info of your creation'
    />
                    </div>
                    <div className="formGroup">
                        <label>SET PRICE</label>
                        <div className="twoForm">
                            <input onChange={(e) => setPrice(e.target.value)} type="text" placeholder='Price'/>
                            <select>
                                <option value="CELO">CELO</option>
                            </select>
                        </div>
                    </div>

                    {loading ?
                        <div className={"tw-text-center"}>
                            <CircleLoader color={"white"}/>
                        </div>

                        :
                        <button disabled={!isFormFiled()} className='secondary-btn' onClick={createNFT}>LFG!</button>
                    }


                </form>
            </div>
        </div>

    )
};

export default Create;
