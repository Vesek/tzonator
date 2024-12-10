from flask import Flask, render_template, request, send_file, send_from_directory
from string import Template
from datetime import date
import re
import os.path
import glob
from io import BytesIO
import tempfile


app = Flask(__name__)
src_path = os.path.dirname(__file__)
font_path = os.path.join(src_path, "fonts", "")

# Load the TeX template
with open(os.path.join(os.path.join(src_path, "templates"), 'template.tex'), 'r') as f:
    template_file = f.read()


@app.route("/", methods=['GET', 'POST'])
def main():
    if request.method == 'POST': # Generate the document on POST
        args = dict()
        for k, v in request.form.items():
            args[k] = v.strip()
        try:
            if not all(len(string) <= 64 for string in args.values()): # Check for illegal lengths
                raise Exception("Moc dlouhý vstup")
            args["fontdir"] = font_path
            args["font"] = "osifont-lgpl3fe.ttf"
            args["date"] = date.fromisoformat(args.get("date")).strftime("%d.%m.%Y")
            if bool(re.match(r"[\w\s\/,-]+$", args.get("groupname"))) and args.get("surname").isalpha() and bool(re.match(r"[\w\s\/,-]+$", args.get("docname"))) and bool(re.match(r"[\w-]+$", args.get("id"))): # Check for illegal characters
                fill = Template(template_file)
                result = fill.substitute(args) # Fill in the template
                with tempfile.NamedTemporaryFile() as tmp: # Create a temp file
                    tmp_name = tmp.name
                    tmp.write(result.encode("utf-8"))
                    tmp.flush()
                    os.system(f"xelatex --interaction=nonstopmode --output-directory={os.path.dirname(tmp_name)} {tmp_name} >/dev/null") # Compile the template and save it to the temp file
                    with open(tmp.name + ".pdf", 'rb') as pdf_f:
                        pdf = BytesIO(pdf_f.read()) # Load the file
                for filename in glob.glob(tmp_name + "*"):
                    os.remove(filename) # Remove the file and all TeX's cache files
                return send_file(pdf, mimetype='application/pdf', as_attachment=True, download_name=f'TZO-{args.get("surname")}-{args.get("id")}.pdf') # Send the compiled file
            else:
                raise Exception("Neplatné znaky")
        except Exception as e:
            print(e)
            return render_template("index.html", error=f"Chyba: {e}")
    else:
        return render_template("index.html")

# Serve fonts
@app.route('/fonts/<path:path>')
def send_report(path):
    return send_from_directory('fonts', path)


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0")
