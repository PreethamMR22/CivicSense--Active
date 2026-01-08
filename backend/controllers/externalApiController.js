import axios from 'axios';

export const submitComplaint = async (req, res) => {
  try {
    const { description, latitude, longitude, citizen_email } = req.body;
    
    const response = await axios.post('https://civicsense-ai-32j8.onrender.com/api/submit-complaint', {
      description,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      citizen_email,
      address: `${latitude},${longitude}`
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error submitting complaint to external API:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Failed to submit complaint to external service'
    });
  }
};

export default {
  submitComplaint
};
