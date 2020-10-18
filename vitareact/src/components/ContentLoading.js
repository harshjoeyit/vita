
import React from 'react'

function ContentLoading(WrappedComponent) {
    return function ContentLoadingComponent({isLoading, ...props}) {
        if(!isLoading) {
            return <WrappedComponent {...props} />
        }
        // TODO:
        // display a nice loader
        return ( 
            <div>
                Waiting for the data......
            </div>
        )
    }
}

export default ContentLoading
