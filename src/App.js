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
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { styled } from "@mui/material/styles";

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

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!pdfFile) {
      toast.error("Please upload a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      setLoading(true);
      setUploadProgress(0);

      const response = await axios.post(
        "https://dj4kw5-8000.csb.app/upload_pdf/",
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
    } catch (error) {
      toast.error("Error uploading the PDF. Try again.");
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
      toast.error("Error querying the PDF.");
      console.error(error);
    } finally {
      setLoading1(false);
    }
  };

  return (
    <StyledContainer maxWidth="md">
      <ToastContainer />
      <Typography variant="h4" align="center" gutterBottom>
        PDF Uploader & Chat
      </Typography>

      <StyledPaper elevation={3}>
        <Typography variant="h6">Upload PDF</Typography>
        <Box display="flex" alignItems="center" marginBottom={2}>
          <UploadButton variant="contained" component="label" color="primary">
            Choose PDF
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={handleFileChange}
            />
          </UploadButton>
          {pdfFile && <Typography>{pdfFile.name}</Typography>}
        </Box>

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
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "Upload PDF"}
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
          disabled={loading1}
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
