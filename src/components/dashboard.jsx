import React, { useState, useEffect } from "react";
import Header from "./Header";
import { Trash } from "lucide-react";
import Sidebar from "./Sidebar";
import "./dashboard.css";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabaseClient";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/webpack";

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

function App({ hideSideNav, isSideNavVisible }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState([]);
  const [tests, setTests] = useState([]);
  const [activeTab, setActiveTab] = useState("documents");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        const { data: userData, error: userCheckError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", user.id)
          .single();

        if (userCheckError) {
          if (userCheckError.message === "No record found") {
            const { error: createUserError } = await supabase.from("users").insert([
              {
                auth_id: user.id,
                full_name: user.user_metadata.full_name || "",
                email: user.email || "",
                profile_image: user.user_metadata.avatar_url || "",
                phone_number: user.user_metadata.phone || "",
              },
            ]);
          }
        }

        setUser(user);

        const { data: docs, error: docsError } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (docsError) throw docsError;
        setDocuments(docs);

        const { data: testResults, error: testsError } = await supabase
          .from("test_results")
          .select(
            `
            id,
            score,
            total_questions,
            correct_answers,
            created_at,
            documents (
              id,
              name,
              file_type
            ),
            test_data,
            metadata
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (testsError) throw testsError;

        const transformedTests = testResults.map((test) => ({
          ...test,
          document_name: test.documents?.name || "Untitled Document",
          test_type: test.metadata?.test_type || "generated",
          question_types: test.metadata?.question_types || {},
        }));

        setTests(transformedTests);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase();
    if (activeTab === "documents") {
      return documents.filter((doc) => doc.name.toLowerCase().includes(query));
    } else {
      return tests.filter((test) => test.document_name.toLowerCase().includes(query));
    }
  };

  function truncateText(text) {
    return text.length > 26 ? text.slice(0, 26) + "..." : text;
  }

  const handleChatClick = () => {
    navigate("/upload");
  };

  const handleTestClick = () => {
    navigate("/Test");
  };

  const extractTextFromPDF = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch PDF");

      const pdfBlob = await response.blob();
      const typedArray = new Uint8Array(await pdfBlob.arrayBuffer());

      const pdfDocument = await getDocument(typedArray).promise;
      let extractedText = "";
      const totalPages = pdfDocument.numPages;

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const page = await pdfDocument.getPage(pageNumber);
        const textContent = await page.getTextContent();
        extractedText += textContent.items.map((item) => item.str).join(" ") + "\n";
      }

      localStorage.setItem("extractedText", extractedText);
      console.log("Text extracted successfully:", extractedText);
      return extractedText;
    } catch (error) {
      console.error("Error extracting text: ", error);
      throw error;
    }
  };

  const handleDocumentClick = async (doc) => {
    localStorage.setItem("documentId", doc.doc_id);
    const { data } = supabase.storage.from("pdfs").getPublicUrl(doc.file_path);
    console.log(data.publicUrl);

    extractTextFromPDF(data.publicUrl);
    navigate("/Documentchat", {
      state: { docId: doc.doc_id },
    });
  };

  return (
    <div className="layout">
      <div className="layout-main">
        <Header />
        <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />
      </div>

      <div className="chat-container2-dashboard">
        <header className="chat-header">
          <div className="morning">
            <h1>Hello {user?.user_metadata?.full_name || "User."}</h1>
          </div>
          <div className="header-part-2">
            <div className="layout-main">
              <Header />
            </div>
            <div className="cards-container">
              <div className="card" onClick={handleChatClick}>
                <div className="card-icon">💬</div>
                <h2>Start a Chat</h2>
                <p>Need to study? Enter a chat and ask about anything you're not sure about.</p>
              </div>
              <div className="card" onClick={handleTestClick}>
                <div className="card-icon">📝</div>
                <h2>Take a Test</h2>
                <p>Feeling confident? Test your knowledge with some multiple choice questions.</p>
              </div>
            </div>

            <p className="terms">
              By uploading a document, you agree to and have read our{" "}
              <a href="#" className="terms-link">
                Terms and Conditions
              </a>
              .
            </p>
          </div>
        </header>

        <div className="title-page-wrapper">
          <div className="filter-section">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${activeTab === "documents" ? "active" : ""}`}
                onClick={() => setActiveTab("documents")}
              >
                PDFs & Documents
              </button>
              <button
                className={`filter-btn ${activeTab === "tests" ? "active" : ""}`}
                onClick={() => setActiveTab("tests")}
              >
                Tests & Quizzes
              </button>
            </div>

            <div className="search-container">
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input4"
              />
              <div className="search-icon">🔍</div>
            </div>

            <div className="sort-dropdown">
              <select className="sort-select">
                <option>Most recent</option>
              </select>
            </div>
          </div>

          <div className="chat-grid">
            {loading ? (
              <div className="loading">Loading {activeTab}...</div>
            ) : error ? (
              <div className="error">Error: {error}</div>
            ) : getFilteredItems().length === 0 ? (
              <div className="no-documents">
                No {activeTab} found.{" "}
                {activeTab === "documents" ? "Upload a document to get started!" : "Take a test to get started!"}
              </div>
            ) : (
              getFilteredItems().map((item) => <div key={item.id}>{item.document_name || item.name}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
