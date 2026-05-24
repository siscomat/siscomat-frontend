import { useState, useEffect, useCallback } from "react";
import { Card, Button, Toast } from "@siscomat/shared-ui";
import {
  FileUploader,
  ListContainer,
  ListElement,
  Modal,
  ModalIcon,
  ModalTitle,
  ModalActions,
  HelpButton,
} from "../components";
import { useAuth } from "../components";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface Plantilla {
  id: number;
  nombre: string;
  created_at: string;
  en_uso: boolean;
}

interface ErrorValidacion {
  encontrados: string[];
  faltantes: string[];
}

const PLANTILLAS_POR_PAGINA = 3;

export const Plantillas = () => {
  const { api } = useAuth();
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [visibleCount, setVisibleCount] = useState(PLANTILLAS_POR_PAGINA);
  const [archivoError, setArchivoError] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [fileUploaderKey, setFileUploaderKey] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [plantillaAEliminar, setPlantillaAEliminar] =
    useState<Plantilla | null>(null);
  const [eliminarError, setEliminarError] = useState("");
  const [errorValidacion, setErrorValidacion] =
    useState<ErrorValidacion | null>(null);
  const [mensajeToast, setMensajeToast] = useState("");

  const fetchPlantillas = useCallback(async () => {
    try {
      const res = await api.get("/plantillas");
      setPlantillas(res.data);
    } catch {
      setGeneralError("No se pudieron cargar las plantillas.");
    }
  }, [api]);

  useEffect(() => {
    fetchPlantillas();
  }, [fetchPlantillas]);

  useEffect(() => {
    document.title = "Plantillas | Administración de SISCOMAT";
  }, []);

  async function handleSubir() {
    let hasError = false;
    let nombreSinExtension = "";

    if (!archivo) {
      setArchivoError("Selecciona un archivo PDF.");
      hasError = true;
    } else {
      nombreSinExtension =
        archivo.name.substring(0, archivo.name.lastIndexOf(".")) ||
        archivo.name;

      if (archivo.type !== "application/pdf") {
        setArchivoError("El archivo debe ser un PDF.");
        hasError = true;
      } else if (archivo.size > 5 * 1024 * 1024) {
        setArchivoError("El archivo no debe superar los 5 MB.");
        hasError = true;
      } else if (nombreSinExtension.length > 150) {
        setArchivoError(
          "El nombre del archivo no puede superar los 150 caracteres.",
        );
        hasError = true;
      } else {
        setArchivoError("");
      }
    }

    if (hasError) return;

    setGeneralError("");
    setErrorValidacion(null);
    setMensajeToast("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", nombreSinExtension);
      formData.append("archivo", archivo!);

      await api.post("/plantillas", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setArchivo(null);
      setFileUploaderKey((k) => k + 1);
      setVisibleCount(PLANTILLAS_POR_PAGINA);
      await fetchPlantillas();

      setMensajeToast("Plantilla subida con éxito");
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.detalles) {
        const detalles = error.response.data.detalles;
        setErrorValidacion({
          encontrados: detalles.placeholders_encontrados,
          faltantes: detalles.placeholders_faltantes,
        });
      } else {
        setGeneralError(
          error.response?.data?.error || "Error al subir la plantilla.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePreview(id: number) {
    if (id === selectedId) return;

    try {
      const res = await api.get(`/plantillas/${id}/archivo`, {
        responseType: "blob",
      });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(res.data);
      setPreviewUrl(url);
      setSelectedId(id);
    } catch {
      setGeneralError("No se pudo cargar el preview.");
    }
  }

  async function handleEliminarConfirmado() {
    if (!plantillaAEliminar) return;
    try {
      await api.delete(`/plantillas/${plantillaAEliminar.id}`);

      if (previewUrl && plantillaAEliminar.id === selectedId) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedId(null);
      }

      setGeneralError("");
      setPlantillaAEliminar(null);
      setEliminarError("");
      await fetchPlantillas();
    } catch (e: any) {
      setEliminarError("Error al eliminar la plantilla.");
    }
  }

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const plantillasVisibles = plantillas.slice(0, visibleCount);
  const hayMas = visibleCount < plantillas.length;
  const hayMenos = visibleCount > PLANTILLAS_POR_PAGINA;

  return (
    <div className="relative w-full max-w-7xl mx-auto p-4 md:py-10 md:px-8 lg:px-16 flex flex-col gap-6">
      <Toast mensaje={mensajeToast} onClose={() => setMensajeToast("")} />

      <Modal
        isOpen={plantillaAEliminar !== null}
        onClose={() => {
          setPlantillaAEliminar(null);
          setEliminarError("");
        }}
      >
        <ModalIcon icon={faTriangleExclamation} variant="error" />
        <ModalTitle title="Eliminar plantilla" />
        <p className="label-normal text-dark-2 text-center">
          ¿Está seguro de que desea eliminar la plantilla "
          {plantillaAEliminar?.nombre}"?
        </p>
        {eliminarError && (
          <p className="label-small text-error-primary text-center mt-2">
            {eliminarError}
          </p>
        )}
        <ModalActions>
          <div className="w-40">
            <Button
              variant="secondary"
              onClick={() => {
                setPlantillaAEliminar(null);
                setEliminarError("");
              }}
            >
              Cancelar
            </Button>
          </div>
          <div className="w-40">
            <Button variant="error" onClick={handleEliminarConfirmado}>
              Sí, eliminar
            </Button>
          </div>
        </ModalActions>
      </Modal>

      <Card className="p-6 lg:p-10 gap-6">
        <h1 className="heading-2 text-center">Gestión de plantillas</h1>

        {generalError && (
          <p className="label-normal text-error-primary text-center">
            {generalError}
          </p>
        )}

        <div className="flex flex-col lg:flex-row gap-6 w-full">
          <div className="flex flex-col gap-4 w-full lg:w-72 shrink-0">
            <Card variant="white" className="p-4 gap-3">
              <div className="flex justify-between items-center w-full">
                <h2 className="heading-5">Cargar plantilla</h2>
                <HelpButton title="Requisitos del archivo">
                  <p className="mb-1">
                    Solo se permiten archivos <strong>.pdf</strong>.
                  </p>
                  <p>
                    El documento debe contener los siguientes{" "}
                    <em>placeholders</em>:
                  </p>
                  <ul className="list-disc pl-4 mt-1 space-y-1 font-mono text-info-darker bg-light-2 p-2 rounded">
                    <li>{`{{NOMBRE COMPLETO PARTICIPANTE}}`}</li>
                    <li>{`{{CURSO}}`}</li>
                    <li>{`{{QR}}`}</li>
                  </ul>
                </HelpButton>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <FileUploader
                  key={fileUploaderKey}
                  accept="application/pdf"
                  onFileSelect={(file) => {
                    setArchivo(file);
                    setErrorValidacion(null);
                    setMensajeToast("");
                  }}
                />

                {archivoError && (
                  <p className="label-small text-error-primary">
                    {archivoError}
                  </p>
                )}

                {errorValidacion && (
                  <div className="mt-2 p-3 bg-error-primary/10 border border-error-primary/30 rounded-md text-xs text-error-primary">
                    <p className="font-bold mb-2">
                      El archivo seleccionado no superó la validación.
                    </p>

                    <p className="font-semibold mt-2">
                      Marcadores requeridos faltantes:
                    </p>
                    <ul className="list-disc pl-4 mb-2">
                      {errorValidacion.faltantes.map((p) => (
                        <li key={`falta-${p}`}>{p}</li>
                      ))}
                    </ul>

                    <p className="font-semibold mt-2">
                      Marcadores identificados en el documento:
                    </p>
                    <ul className="list-disc pl-4">
                      {errorValidacion.encontrados.length > 0 ? (
                        errorValidacion.encontrados.map((p) => (
                          <li key={`enc-${p}`}>{p}</li>
                        ))
                      ) : (
                        <li>Ninguno</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <Button onClick={handleSubir} disabled={loading}>
                {loading ? "Subiendo..." : "Subir plantilla"}
              </Button>
            </Card>

            <Card variant="white" className="p-4 gap-3">
              <h2 className="heading-5">Plantillas cargadas</h2>
              <ListContainer
                isEmpty={plantillasVisibles.length === 0}
                emptyMessage="No hay plantillas registradas."
              >
                {plantillasVisibles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handlePreview(p.id)}
                    className={`cursor-pointer rounded-md ${selectedId === p.id ? "ring-2 ring-brand-primary" : ""}`}
                  >
                    <ListElement
                      nombre={p.nombre}
                      fechaCreacion={formatFecha(p.created_at)}
                      onDelete={
                        p.en_uso ? undefined : () => setPlantillaAEliminar(p)
                      }
                    />
                  </div>
                ))}
              </ListContainer>

              <div className="w-full flex items-center justify-center gap-4">
                {hayMenos && (
                  <button
                    onClick={() => setVisibleCount(PLANTILLAS_POR_PAGINA)}
                    className="label-small text-dark-3 hover:text-dark-2 transition-colors cursor-pointer"
                  >
                    Ver menos
                  </button>
                )}
                {hayMas && (
                  <button
                    onClick={() =>
                      setVisibleCount((c) => c + PLANTILLAS_POR_PAGINA)
                    }
                    className="label-small text-brand-primary hover:text-brand-lighter transition-colors cursor-pointer"
                  >
                    Ver más
                  </button>
                )}
              </div>
            </Card>
          </div>

          <Card variant="white" className="flex-1 overflow-hidden min-h-96 p-4">
            {previewUrl ? (
              <iframe
                src={previewUrl + "#toolbar=0"}
                className="w-full h-full min-h-96"
                title="Preview plantilla"
              />
            ) : (
              <div className="w-full h-full min-h-96 flex items-center justify-center p-4">
                <p className="label-normal text-dark-3 text-center">
                  Selecciona una plantilla para previsualizarla
                </p>
              </div>
            )}
          </Card>
        </div>
      </Card>
    </div>
  );
};
