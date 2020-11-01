import React, {useState, useEffect} from 'react';
import axiosInstance from '../../axios';
import axios from 'axios';
import {useHistory} from 'react-router-dom';
import formStyles from '../css/forms.module.css';
import Popup from '../utils/Popup';

// Returns the edit video form

function EditVideo({id}) {
    
    // TODO:
    // 1.
    // add form validation for file types 
    // both in react and django, add error types for files 
    // 2.
    // check for only admin upload
    const history = useHistory();
    // video id send as parameter [edit/:id]
    // const {id} = useParams();

    const initTextData = Object.freeze({
        title: '',
        description: '',
        playtime: 0,
        category: -1
    });
    const initErrors = {
        emptyFormError: null,
        authError: null
    }
    const initUploadState = {
        uploadProgress: 0,
        source:null
    }
    const initSelectedMembership = {
        free: false,
        ent: false,
        pro: false
    }


    // states 
    // category options
    const [categoryOptions, setCategoryOptions] = useState([])
    // form data 
    const [textData, setTextData] = useState(initTextData)
    const [thumbnail, setThumbnail] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    // form error
    const [error, setError] = useState(initErrors);
    // form upload
    const [uploadState, setUploadState] = useState(initUploadState);
    // popup
    const [showPopup, setShowPopup] = useState(false);
    // membership options 
    const [selectedMembership, setSelectedMembership] = useState(initSelectedMembership)


    // fill the edit form with current values 
    useEffect(() => {
        axiosInstance
            .get(`video/video-list/${id}/`)
            .then(res => {
                console.log(res);
                setTextData({
                    ...textData,
                    title: res.data.title,
                    description: res.data.description,
                    playtime: res.data.playtime,
                    category: res.data.category
                })
                let memData = res.data.allowed_membership;

                setSelectedMembership({
                    free: memData.includes(1),
                    ent: memData.includes(2),
                    pro: memData.includes(3)
                })
            })
            .catch(err => {
                if(err.data.detail == "Not found.") {
                    // Display error message, the video was not found 
                    // return
                    alert('The video was not found');
                    history.push('/');
                }
            });
    }, []);

    // getting category options
    useEffect(() => {
        // getting category options
        axiosInstance
            .get(`video/categories/`)
            .then(res => {
                setCategoryOptions(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    // listener
    const handleChange = (e) => {
        if([e.target.name] == 'thumbnail') {
            setThumbnail({
                thumbnail: e.target.files
            });
        } else if([e.target.name] == 'videoFile') {
            setVideoFile({
                videoFile: e.target.files
            });
        } else {
            setTextData({
                ...textData,
                [e.target.name]: e.target.value
            });
        }
    }

    // listener
    // TODO: 
    // upload progress bar 
    const handleSubmit = (e) => {
        console.log(textData);
        console.log(thumbnail);
        console.log(videoFile);
        e.preventDefault();
        // validate form
        if(!vaidateDetails()) {
            return;
        }

        let formData = new FormData();

        formData.append('title', textData.title.trim());
        formData.append('description', textData.description.trim());
        formData.append('category', textData.category);
        formData.append('playtime', textData.playtime);

        if(thumbnail) {
            formData.append('thumbnail',thumbnail.thumbnail[0]);
        }
        if(videoFile) {
            formData.append('videoFile', videoFile.videoFile[0]);
        }
        console.log(formData);

        // upload progress
        const cancelToken = axios.CancelToken;
        const source = cancelToken.source();
        setUploadState({
            ...uploadState,
            source: source
        });

        let config = {
            onUploadProgress: function(progressEvent) {
                let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total);
                setUploadState({
                    ...uploadState,
                    uploadProgress: percentCompleted
                });
            },
            cancelToken: source.token
        };

        // changed to path request, admin may change whatever he wishes
        axiosInstance
            .patch(`video/video-list/${id}/`, formData, config)
            .then(res => {
                saveMembership(res.data.id);
            })
            .catch(err => {
                console.log(err);
                if(err.data.detail == "Invalid token header. No credentials provided.") {
                    setError({
                        emptyFormError: null,
                        authError: 'No credentials provided, unauthorized.'
                    });
                }
            });
    }

    // cancel handler 
    const handleCancelUpload = () => {
        console.log(uploadState.source);
        uploadState.source.cancel();
        setUploadState({
            source: null,
            uploadProgress: 0
        });
    }

    // form validators 
    const vaidateDetails = () => {
        if (textData.title === "" || textData.description === "" || 
            textData.category === -1 || textData.playtime <= 0) {
            // update the errors in form
            setError({
                authError: null,
                emptyFormError: 'Fileds cannot be empty, invalid'
            });
            return false;
        } else {
            // form is completely filled
            setError({
                authError:null,
                emptyFormError: null
            });
            return true;
        }
    }

    /*
        patch request for saving membership of the video
    */
    const saveMembership = async (id) => {
        let allowed_membership = []
        if(selectedMembership.free) {
            allowed_membership.push('1')
        }
        if(selectedMembership.ent) {
            allowed_membership.push('2')
        }
        if(selectedMembership.pro) {
            allowed_membership.push('3')
        }
    
        const body = {
            allowed_membership: allowed_membership
        }
        const res = await axiosInstance.patch(`video/video-list/${id}/`, body)
        console.log(res);
        
        setShowPopup(true);
        setTimeout(() => {
            history.push({
                pathname: `/admin/video-details/${id}`,
            });
            window.location.reload();
        }, 1500);
    }

    return (
        <div className={formStyles.formBG}>
            <Popup show={showPopup} message="Changes Saved Successfully" type="success"/>
            <div className={formStyles.videoFormContainer}>
                <h2 className={formStyles.heading}>Edit Video Details</h2>
                {
                    (error.authError) 
                    ? (<div className={formStyles.error}> {error.authError} </div>)
                    : (<></>)
                }
                {
                    (error.emptyFormError)
                    ? (<div className={formStyles.error}> {error.emptyFormError} </div>)
                    : (<></>)
                }
                {
                    (uploadState.uploadProgress > 0) 
                    ? (
                        <div className={formStyles.uploadProgress}>
                            <div  className={formStyles.error}>Upload: {uploadState.uploadProgress}%</div>
                            <button 
                                className={formStyles.videoSubmitBtn}
                                type="submit"
                                onClick={handleCancelUpload}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <></>
                    )
                }
                <div className={formStyles.videoFormRow}>
                    <div className={formStyles.videoFormCol}>
                        <div>
                            <input 
                                type="text" 
                                name="title"
                                value={textData.title}
                                required
                                placeholder="Video title"
                                onChange={handleChange}
                                className={formStyles.videoInput}
                            />
                        </div>
                        <div>
                            <textarea 
                                rows="10"
                                name="description"
                                required
                                value={textData.description}
                                placeholder="Storyline"
                                onChange={handleChange}
                                className={formStyles.videoInput}
                                style={{resize: 'none'}}
                            /> 
                        </div>

                        {/* mebership select */}
                        <div className={formStyles.videoCheckboxContainer}>
                            <p>Allowed Membership</p>
                            <div className={formStyles.checkboxInputs}>
                                <div className={formStyles.checkInput}>
                                    <input 
                                        name='free'
                                        type='checkbox'
                                        checked={selectedMembership.free}
                                        onChange = {(e) => {
                                            setSelectedMembership({
                                               ...selectedMembership,
                                               free: !selectedMembership.free   
                                        })
                                        }}
                                    /> 
                                    <label style={{color: 'white'}}> 
                                       Free
                                    </label>
                                </div>

                                <div className={formStyles.checkInput}>
                                    <input 
                                        name='ent'
                                        type='checkbox' 
                                        checked={selectedMembership.ent}
                                        onChange = {(e) => {
                                            setSelectedMembership({
                                               ...selectedMembership,
                                               ent: !selectedMembership.ent   
                                        })
                                        }}
                                    /> 
                                    <label style={{color: 'white'}}> 
                                       Enterprise
                                    </label>
                                </div>

                                <div className={formStyles.checkInput}>
                                    <input 
                                        name='pro'
                                        type='checkbox'
                                        checked={selectedMembership.pro}
                                        onChange = {(e) => {
                                            setSelectedMembership({
                                               ...selectedMembership,
                                               pro: !selectedMembership.pro   
                                        })
                                        }}
                                    /> 
                                    <label style={{color: 'white'}}> 
                                       Pro
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
            
                    <div className={formStyles.videoFormCol}>
                        <div>
                            <input 
                                className={formStyles.videoInput}
                                type="file"
                                accept="image/*" 
                                id="thumbnail"
                                name="thumbnail"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <input 
                                className={formStyles.videoInput}
                                type="file"
                                accept="video/*" 
                                id="videoFile"
                                name="videoFile"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <input 
                                className={formStyles.videoInput}
                                type="number" 
                                name="playtime"
                                required
                                value={textData.playtime}
                                placeholder="Play time (minutes)"
                                onChange={handleChange}
                                min='0'
                            /> 
                        </div>
                    
                        <div className={formStyles.videoSelectInputContainer}>
                            <select 
                                value={textData.category} 
                                onChange={(e) => {
                                    setTextData({
                                        ...textData,
                                        category: e.target.value
                                    })
                                }}>
                                <option 
                                    key='0'
                                    value='-1'
                                > 
                                    Select
                                </option>
                                {
                                    categoryOptions.map(option => (
                                        <option 
                                            key={option.id} 
                                            value={option.id}
                                        > 
                                            {option.category}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                    </div>
                    <button 
                        type="submit"
                        onClick={handleSubmit}
                        className={formStyles.videoSubmitBtn}
                    >
                        Update   
                    </button> 
                </div>
            </div>
        </div>
    )
}

export default EditVideo
