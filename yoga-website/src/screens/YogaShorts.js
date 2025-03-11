import React, { useEffect, useState } from 'react';
import yogaData from '../services/yoga.json';

const YogaShorts = () => {
    const [asanas, setAsanas] = useState([]);
    const [selectedAsana, setSelectedAsana] = useState(null);

    useEffect(() => {
        setAsanas(yogaData.asanas || []);
    }, []);

    const getEmbeddedUrl = (url) => {
        if (url.includes("shorts/")) {
            return url.replace("shorts/", "embed/");
        }
        return url.replace("watch?v=", "embed/");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <select
                value={selectedAsana?.name || ''}
                onChange={(e) => {
                    const selected = asanas.find(asana => asana.name === e.target.value);
                    setSelectedAsana(selected);
                }}
                style={{ padding: '8px', marginBottom: '20px', width: '60%', textAlign: 'center', borderRadius: '5px', border: '1px solid pink' }}
            >
                <option value="">Select a yoga pose...</option>
                {asanas.map((asana, index) => (
                    <option key={index} value={asana.name}>{asana.name}</option>
                ))}
            </select>
            {selectedAsana && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <h2>{selectedAsana.name}</h2>
                    {selectedAsana?.yt_videos?.length > 0 && (
                        <iframe
                            width="560"
                            height="315"
                            src={getEmbeddedUrl(selectedAsana.yt_videos[0].url)}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    )}
                    <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '560px', margin: '20px auto' }}>
                        <h3>{selectedAsana.english_name}</h3>
                        <p>{selectedAsana.description}</p>
                        <h4>Benefits:</h4>
                        <ul>
                            {selectedAsana.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YogaShorts;
