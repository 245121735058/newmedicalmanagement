import React, { useState } from 'react';
import { X, Plus, Search, FileText, Pill, Eye, Upload, XCircle } from 'lucide-react';

import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Label } from "./components/ui/label"
import { toast } from "./components/ui/use-toast"

// Simulated dataset for medicine prediction
const medicineDataset = [
  { disease: "Common Cold", symptoms: ["runny nose", "sore throat", "cough"], medicines: ["Acetaminophen", "Dextromethorphan", "Pseudoephedrine"] },
  { disease: "Influenza", symptoms: ["fever", "body aches", "fatigue"], medicines: ["Oseltamivir", "Zanamivir", "Peramivir"] },
  { disease: "Allergies", symptoms: ["sneezing", "itchy eyes", "congestion"], medicines: ["Loratadine", "Cetirizine", "Fexofenadine"] },
  { disease: "Migraine", symptoms: ["severe headache", "nausea", "light sensitivity"], medicines: ["Sumatriptan", "Rizatriptan", "Almotriptan"] },
  { disease: "Hypertension", symptoms: ["high blood pressure", "headache", "shortness of breath"], medicines: ["Lisinopril", "Amlodipine", "Metoprolol"] },
];

type Report = {
  id: number;
  date: string;
  disease: string;
  file: File | null;
  fileContent: string;
  doctorName: string;
  hospitalName: string;
};

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [newReport, setNewReport] = useState<Report>({
    id: 0,
    date: '',
    disease: '',
    file: null,
    fileContent: '',
    doctorName: '',
    hospitalName: '',
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [predictedMedicines, setPredictedMedicines] = useState<string[]>([]);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'TEST') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid password. Please try again.');
    }
  };

  const handleAddReport = () => {
    if (newReport.date && newReport.disease && newReport.doctorName && newReport.hospitalName && newReport.file) {
      setReports([...reports, { ...newReport, id: Date.now() }]);
      setNewReport({
        id: 0,
        date: '',
        disease: '',
        file: null,
        fileContent: '',
        doctorName: '',
        hospitalName: '',
      });
    }
  };

  const handleDeleteReport = (id: number) => {
    setReports(reports.filter(report => report.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          const content = event.target.result as string;
          setNewReport({ ...newReport, file, fileContent: content });
          setIsUploading(false);
          toast({
            title: "File uploaded successfully",
            description: "Your file has been uploaded and is ready to view.",
          });
        }
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your file. Please try again.",
          variant: "destructive",
        });
      };
      if (file.type === 'application/pdf') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const handleSymptomChange = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const predictMedicines = () => {
    const matchingDiseases = medicineDataset.filter(data => 
      selectedSymptoms.some(symptom => data.symptoms.includes(symptom))
    );
    const medicines = Array.from(new Set(matchingDiseases.flatMap(d => d.medicines)));
    setPredictedMedicines(medicines);
    setShowPredictionModal(true);
  };

  const handleViewFile = (fileContent: string, fileName: string) => {
    setSelectedFileContent(fileContent);
    setSelectedFileName(fileName);
    setShowFileModal(true);
  };

  const handleCloseFile = () => {
    setShowFileModal(false);
    setSelectedFileContent('');
    setSelectedFileName('');
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-2xl font-bold">Patient Login</h2>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
            required
          />
          <Button type="submit" className="w-full">Login</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Medical Management System</h1>
      
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Report Management
          </TabsTrigger>
          <TabsTrigger value="predictor">
            <Pill className="mr-2 h-4 w-4" />
            Medicine Predictor
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Management System</CardTitle>
              <CardDescription>Add and manage medical reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Add New Report</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newReport.date}
                      onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disease">Disease</Label>
                    <Input
                      id="disease"
                      type="text"
                      value={newReport.disease}
                      onChange={(e) => setNewReport({ ...newReport, disease: e.target.value })}
                      placeholder="Disease"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">Doctor Name</Label>
                    <Input
                      id="doctorName"
                      type="text"
                      value={newReport.doctorName}
                      onChange={(e) => setNewReport({ ...newReport, doctorName: e.target.value })}
                      placeholder="Doctor Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name</Label>
                    <Input
                      id="hospitalName"
                      type="text"
                      value={newReport.hospitalName}
                      onChange={(e) => setNewReport({ ...newReport, hospitalName: e.target.value })}
                      placeholder="Hospital Name"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="file">Upload Report</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileUpload}
                        accept=".txt,.pdf,.doc,.docx"
                        disabled={isUploading}
                      />
                      {isUploading && <Upload className="animate-spin h-4 w-4" />}
                    </div>
                    {newReport.file && (
                      <p className="text-sm text-green-600">File uploaded successfully: {newReport.file.name}</p>
                    )}
                  </div>
                </div>
                <Button onClick={handleAddReport} className="mt-4" disabled={isUploading}>
                  <Plus className="mr-2 h-4 w-4" /> Add Report
                </Button>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Medical Reports</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Disease</TableHead>
                      <TableHead>Doctor Name</TableHead>
                      <TableHead>Hospital Name</TableHead>
                      <TableHead>Report File</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>{report.disease}</TableCell>
                        <TableCell>{report.doctorName}</TableCell>
                        <TableCell>{report.hospitalName}</TableCell>
                        <TableCell>
                          {report.file && (
                            <Button variant="outline" onClick={() => handleViewFile(report.fileContent, report.file!.name)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="destructive" onClick={() => handleDeleteReport(report.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="predictor">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Predictor System</CardTitle>
              <CardDescription>Predict medicines based on symptoms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Select Symptoms</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.from(new Set(medicineDataset.flatMap(data => data.symptoms))).map((symptom, index) => (
                    <Button
                      key={index}
                      variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                      onClick={() => handleSymptomChange(symptom)}
                      className={selectedSymptoms.includes(symptom) ? "bg-blue-500 text-white" : ""}
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
                <Button onClick={predictMedicines} className="mt-4">
                  <Search className="mr-2 h-4 w-4" /> Predict Medicines
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPredictionModal} onOpenChange={setShowPredictionModal}>
        <DialogContent className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">Predicted Medicines</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {predictedMedicines.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {predictedMedicines.map((medicine, index) => (
                  <li key={index} className="text-gray-700">{medicine}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No matching medicines found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFileModal} onOpenChange={setShowFileModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>View Report: {selectedFileName}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 relative">
            {selectedFileName.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={selectedFileContent}
                className="w-full h-[600px]"
                title="PDF Viewer"
              />
            ) : (
              <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md max-h-[600px] overflow-y-auto">
                {selectedFileContent}
              </pre>
            )}
            <Button
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={handleCloseFile}
            >
              <XCircle className="mr-2 h-4 w-4" /> Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;