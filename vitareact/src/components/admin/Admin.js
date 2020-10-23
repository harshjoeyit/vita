import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import '../css/adminHome.css';
import axiosInstance from '../../axios';
import VideoResults from './VideoResults';
import commentResults from './CommentResults';
import ContentLoading from '../ContentLoading';
import CommentResults from './CommentResults';

// Admin Options Avalailable 

// Video options
    // components
        // 1. video result box [for search/filter results] / by default shows recently reported videos
    // Features 
        // 1. Upload new  video
        // 2. Search for videos 
        // 3. Filter, Sort for videos [by most reported, date/time ... etc]
        // 4. Link to detail page

// Comment options
    // components 
        // 1. comment result box [for filter results] / by default shows recently reported comments
    // Featurs 
        // 1. Filter, Sort for videos [by most reported, date/time... etc]
        // 2. Link to detail page 

function Admin() {

    const VideoResultsLoading = ContentLoading(VideoResults);
    const CommentResultsLoading = ContentLoading(CommentResults);

    const initHeading = {
        videoHeading: 'Recent Video Reports',
        commentHeading: 'Recent Comment Reports'
    }

    const [boxHeading, setBoxHeading] = useState(initHeading);
    const [videoResults, setVideoResults] = useState([]);
    const [commentResults, setCommentResults] = useState([]);
    const [videoResLoading, setVideoResLoadingLoading] = useState(false);
    const [commentResLoading, setCommentResLoading] = useState(false);

    useEffect(() => {
        // recent reported videos 
        axiosInstance
            .get(`video/reported-video-list/`)
            .then(res => {
                setVideoResults(res.data);
                // console.log(res.data)
                setVideoResLoadingLoading(false);
            })
            .catch(err => {
                console.log(err);
            });
    }, [])

    useEffect(() => {
        axiosInstance
            .get(`video/reported-comment-list/`)
            .then(res => {
                setCommentResults(res.data);
                // console.log(res.data)
                setCommentResLoading(false);
            })
            .catch(err => {
                console.log(err);
            });
    }, [])

    // search handlers
    const handleSearchChange = () => {
    }
    // search submit handler
    const handleSearchSubmit = () => {
    }

    return (
        
        <div>
            <h1><u>Admin Home</u></h1>
            
            <Link 
                to={`/admin/create`}>
                <button 
                    id="create-new-btn">
                    Create New Video
                </button>
            </Link>
            
            <div id='search-container'>
                <input 
                    id='admin-search-box'
                    type='text' 
                    name='searchbox' 
                    onChange={handleSearchChange}
                    placeholder='Search Videos'
                />
                <button 
                    id='admin-search-btn'
                    type='submit'
                    onClick={handleSearchSubmit}
                >
                    Search
                </button>
            </div>

            <div>  
                <h3>Options</h3>
                <button>Most views</button>
                <button>Most Likes</button>
                <button>Most Reported</button>
            </div>

            <div className="row">
                <div className="col">
                    {/* heading changes based on serach/filter applied */}
                    <h2>{boxHeading.videoHeading}</h2>
                    {/* video results */}
                    <VideoResultsLoading 
                        isLoading={videoResLoading}
                        allVideos={videoResults}
                    />
                </div>
                <div className="col">
                    {/* heading changes based on serach/filter applied */}
                    <h2>{boxHeading.commentHeading}</h2>
                    {/* comments results */}
                    <CommentResultsLoading 
                        isLoading={commentResLoading}
                        allComments={commentResults}
                    />
                </div>
            </div>
        </div>
    )
}

export default Admin
