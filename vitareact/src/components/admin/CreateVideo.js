import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axios';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import formStyles from '../css/forms.module.css';
import Popup from '../utils/Popup';
import Header from '../Header';
import Preloader from '../utils/Preloader';

function CreateVideo() {
	// TODO:
	// 1.
	// add form validation for file types
	// both in react and django, add error types for files
	// 2.
	// check for only admin upload
	const history = useHistory();

	const initTextData = Object.freeze({
		title: '',
		description: '',
		playtime: 0,
		category: -1,
		status: 'published',
	});
	const initErrors = {
		emptyFormError: null,
		authError: null,
	};
	const initUploadState = {
		uploadProgress: 0,
		source: null,
	};
	const initSelectedMembership = {
		free: false,
		ent: false,
		pro: false,
	};

	// states
	// category options
	const [categoryOptions, setCategoryOptions] = useState([]);
	// form data
	const [textData, setTextData] = useState(initTextData);
	const [thumbnail, setThumbnail] = useState(null);
	const [videoFile, setVideoFile] = useState(null);
	// form error
	const [error, setError] = useState(initErrors);
	// form upload
	const [uploadState, setUploadState] = useState(initUploadState);
	// popup
	const [showPopup, setShowPopup] = useState(false);
	// membership options
	const [selectedMembership, setSelectedMembership] = useState(
		initSelectedMembership
	);
	// status options
	const statusOptions = [
		{
			id: 1,
			name: 'published',
		},
		{
			id: 2,
			name: 'draft',
		},
	];

	useEffect(() => {
		// getting category options
		axiosInstance
			.get(`video/categories/`)
			.then((res) => {
				setCategoryOptions(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	// listener
	const handleChange = (e) => {
		if ([e.target.name] == 'thumbnail') {
			setThumbnail({
				thumbnail: e.target.files,
			});
		} else if ([e.target.name] == 'videoFile') {
			setVideoFile({
				videoFile: e.target.files,
			});
		} else {
			setTextData({
				...textData,
				[e.target.name]: e.target.value,
			});
		}
	};

	// listener
	// TODO:
	// upload progress bar
	const handleSubmit = (e) => {
		e.preventDefault();

		// validate form
		if (!vaidateDetails()) {
			return;
		}

		let formData = new FormData();

		formData.append('title', textData.title.trim());
		formData.append('description', textData.description.trim());
		formData.append('category', textData.category);
		formData.append('playtime', textData.playtime);
		formData.append('thumbnail', thumbnail.thumbnail[0]);
		formData.append('videoFile', videoFile.videoFile[0]);
		formData.append('status', textData.status);

		// upload progress
		const cancelToken = axios.CancelToken;
		const source = cancelToken.source();
		setUploadState({
			...uploadState,
			source: source,
		});

		// TODO:
		// progress not in sync with upload
		// try putting a loader in place of progress bar

		// config for upload progress
		let config = {
			onUploadProgress: function (progressEvent) {
				let percentCompleted = Math.round(
					(progressEvent.loaded * 100) / progressEvent.total
				);
				setUploadState({
					...uploadState,
					uploadProgress: percentCompleted,
				});
			},
			cancelToken: source.token,
		};

		// send post request to create video
		axiosInstance
			.post(`video/video-list/`, formData, config)
			.then((res) => {
				saveMembership(res.data.id);
			})
			.catch((err) => {
				console.log(err);
				if (
					err.data.detail ==
					'Invalid token header. No credentials provided.'
				) {
					setError({
						emptyFormError: null,
						authError: 'No credentials provided, unauthorized.',
					});
				}
			});
	};

	// upload cancel handler
	const handleCancelUpload = () => {
		uploadState.source.cancel();
		setUploadState({
			source: null,
			uploadProgress: 0,
		});
	};

	// form validators
	const vaidateDetails = () => {
		if (
			textData.title === '' ||
			textData.description === '' ||
			textData.category === -1 ||
			textData.playtime <= 0 ||
			textData.allowed_membership === -1 ||
			thumbnail === null ||
			videoFile === null
		) {
			// update the errors in form
			setError({
				authError: null,
				emptyFormError: 'Fill all fileds, upload all files',
			});
			return false;
		} else {
			// form is completely filled
			setError({
				authError: null,
				emptyFormError: null,
			});
			return true;
		}
	};

	/*
        patch request for saving membership of the video
    */

	const saveMembership = async (id) => {
		let allowed_membership = [];

		if (selectedMembership.free) {
			allowed_membership.push('1');
		}
		if (selectedMembership.ent) {
			allowed_membership.push('2');
		}
		if (selectedMembership.pro) {
			allowed_membership.push('3');
		}

		const body = {
			allowed_membership: allowed_membership,
		};

		const res = await axiosInstance.patch(`video/video-list/${id}/`, body);

		setShowPopup(true);
		setTimeout(() => {
			history.push({
				pathname: `/admin/video-details/${id}`,
			});
			window.location.reload();
		}, 1500);
	};

	return (
		<>
			<Header />
			<div style={{ height: '60px' }}></div>
			<div className={formStyles.formBG}>
				<Popup
					show={showPopup}
					message='Video Uploaded Successfully'
					type='success'
				/>
				<div className={formStyles.videoFormContainer}>
					<h2 className={formStyles.heading}>Create new video</h2>
					{/* TODO:
                    create seperate error component, 
                    to be used it in all forms
                */}
					{error.authError ? (
						<div className={formStyles.error}>
							{' '}
							{error.authError}{' '}
						</div>
					) : (
						<></>
					)}
					{error.emptyFormError ? (
						<div className={formStyles.error}>
							{' '}
							{error.emptyFormError}{' '}
						</div>
					) : (
						<></>
					)}
					{uploadState.uploadProgress > 0 ? (
						<div style={{width: '100%', height: '10vh'}}>
                            <Preloader />
                        </div>
					) : (
						<></>
					)}

					<div className={formStyles.videoFormRow}>
						<div className={formStyles.videoFormCol}>
							<div>
								<input
									type='text'
									name='title'
									required
									placeholder='Video title'
									onChange={handleChange}
									className={formStyles.videoInput}
								/>
							</div>
							<div>
								<textarea
									rows='10'
									name='description'
									required
									placeholder='Storyline'
									onChange={handleChange}
									className={formStyles.videoInput}
									style={{ resize: 'none' }}
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
											onChange={(e) => {
												setSelectedMembership({
													...selectedMembership,
													free: !selectedMembership.free,
												});
											}}
										/>
										<label style={{ color: 'white' }}>
											Free
										</label>
									</div>

									<div className={formStyles.checkInput}>
										<input
											name='ent'
											type='checkbox'
											checked={selectedMembership.ent}
											onChange={(e) => {
												setSelectedMembership({
													...selectedMembership,
													ent: !selectedMembership.ent,
												});
											}}
										/>
										<label style={{ color: 'white' }}>
											Enterprise
										</label>
									</div>

									<div className={formStyles.checkInput}>
										<input
											name='pro'
											type='checkbox'
											checked={selectedMembership.pro}
											onChange={(e) => {
												setSelectedMembership({
													...selectedMembership,
													pro: !selectedMembership.pro,
												});
											}}
										/>
										<label style={{ color: 'white' }}>
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
									type='file'
									accept='image/*'
									id='thumbnail'
									name='thumbnail'
									onChange={handleChange}
									required
								/>
							</div>
							<div>
								<input
									className={formStyles.videoInput}
									type='file'
									accept='video/*'
									id='videoFile'
									name='videoFile'
									onChange={handleChange}
									required
								/>
							</div>
							<div>
								<input
									className={formStyles.videoInput}
									type='number'
									name='playtime'
									required
									placeholder='Play time (minutes)'
									onChange={handleChange}
									min='0'
								/>
							</div>
							<div
								className={formStyles.videoSelectInputContainer}
							>
								<select
									value={textData.category}
									onChange={(e) => {
										setTextData({
											...textData,
											category: e.target.value,
										});
									}}
								>
									<option key='0' value='-1'>
										Select
									</option>
									{categoryOptions.map((option) => (
										<option
											key={option.id}
											value={option.id}
										>
											{option.category}
										</option>
									))}
								</select>
							</div>

							{/* video status drop down */}
							<div
								className={formStyles.videoSelectInputContainer}
							>
								<select
									value={textData.status}
									onChange={(e) => {
										setTextData({
											...textData,
											status: e.target.value,
										});
									}}
								>
									{statusOptions.map((option) => (
										<option
											key={option.id}
											value={option.name}
										>
											{option.name}
										</option>
									))}
								</select>
							</div>
						</div>
						<button
							type='submit'
							onClick={handleSubmit}
							className={formStyles.videoSubmitBtn}
						>
							Create
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

export default CreateVideo;
