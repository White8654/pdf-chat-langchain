import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Paper,
  Container,
  LinearProgress,
  Divider,
  Grid,
  IconButton,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { styled } from "@mui/material/styles";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";

// Styled components for improved design
const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(6),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ProgressBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
}));

const UploadButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(2),
}));

const ChatHistoryBox = styled(Box)(({ theme }) => ({
  maxHeight: "400px",
  overflowY: "auto",
  padding: theme.spacing(2),
}));

const PdfBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.grey[100],
}));

function App() {
  const [pdfFiles, setPdfFiles] = useState([]); // For handling multiple PDFs
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false); // Track upload status

  const handleFileChange = (event) => {
    setPdfFiles(event.target.files);
  };

  const handleFileUpload = async () => {
    if (pdfFiles.length === 0) {
      toast.error("Please upload PDF files first.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < pdfFiles.length; i++) {
      formData.append("files", pdfFiles[i]); // Append multiple files
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      const response = await axios.post(
        "https://dj4kw5-8000.csb.app/upload_pdfs/", // Correct endpoint for multiple files
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      toast.success(response.data.message);
      setIsUploaded(true); // Mark as uploaded
    } catch (error) {
      toast.error("Error uploading the PDFs. Try again.");
      console.error(error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleQuerySubmit = async () => {
    if (query === "") {
      toast.error("Please enter a question.");
      return;
    }

    try {
      setLoading1(true);
      const response = await axios.post("https://dj4kw5-8000.csb.app/query/", {
        query: query,
      });

      const chatResponse = {
        user: query,
        bot: response.data.response,
      };

      setChatHistory((prev) => [...prev, chatResponse]);
      setQuery("");
    } catch (error) {
      toast.error("Error querying the PDFs.");
      console.error(error);
    } finally {
      setLoading1(false);
    }
  };

  const handleRemoveFile = (fileName) => {
    setPdfFiles((prevFiles) =>
      Array.from(prevFiles).filter((file) => file.name !== fileName)
    );
  };

  return (
    <StyledContainer maxWidth="md">
      <ToastContainer />
      <Typography variant="h4" align="center" gutterBottom>
        PDF Uploader & Chat
      </Typography>

      <StyledPaper elevation={3}>
        <Typography variant="h6">Upload PDFs</Typography>
        <Box display="flex" alignItems="center" marginBottom={3}>
          <UploadButton variant="contained" component="label" color="primary">
            Choose PDFs
            <input
              type="file"
              accept="application/pdf"
              hidden
              multiple // Allow multiple file selection
              onChange={handleFileChange}
            />
          </UploadButton>
        </Box>

        {/* Display PDF Files in Grid */}
        <Grid container spacing={2}>
          {Array.from(pdfFiles).map((file) => (
            <Grid item xs={12} key={file.name}>
              <PdfBox>
                <Box display="flex" alignItems="center">
                  <PictureAsPdfIcon color="error" style={{ marginRight: 8 }} />
                  <Typography variant="body1">{file.name}</Typography>
                </Box>
              </PdfBox>
            </Grid>
          ))}
        </Grid>

        {uploadProgress > 0 && (
          <ProgressBox>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              style={{ flex: 1 }}
            />
            <Typography style={{ marginLeft: 8 }}>{uploadProgress}%</Typography>
          </ProgressBox>
        )}

        <Button
          variant="contained"
          color="secondary"
          onClick={handleFileUpload}
          disabled={loading || isUploaded || pdfFiles.length === 0} // Disable if uploading or already uploaded
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "Upload PDFs"}
        </Button>
      </StyledPaper>

      <StyledPaper elevation={3}>
        <Typography variant="h6">Ask a Question</Typography>
        <TextField
          fullWidth
          label="Type your question here..."
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleQuerySubmit}
          disabled={loading1 || !isUploaded} // Disable if not uploaded
          fullWidth
        >
          {loading1 ? <CircularProgress size={24} /> : "Ask"}
        </Button>
      </StyledPaper>

      <StyledPaper elevation={3}>
        <Typography variant="h6">Chat History</Typography>
        <Divider />
        <ChatHistoryBox>
          {chatHistory.length > 0 ? (
            chatHistory.map((chat, index) => (
              <Box key={index} marginBottom={2}>
                <Typography variant="body1">
                  <strong>You:</strong> {chat.user}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Bot:</strong> {chat.bot}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No chat history yet.
            </Typography>
          )}
        </ChatHistoryBox>
      </StyledPaper>
    </StyledContainer>
  );
}

export default App;
