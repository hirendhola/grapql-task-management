import React from 'react'

const Spinner = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="305" height="305">
      <g>
        <path stroke="none" fill="#191818" d="M44 50A6 6 0 0 0 56 50A6 7 0 0 1 44 50">
          <animateTransform
            values="0 50 50.5;360 50 50.5"
            keyTimes="0;1"
            repeatCount="indefinite"
            dur="0.2898550724637681s"
            type="rotate"
            attributeName="transform"
          />
        </path>
      </g>
    </svg>)
}

export default Spinner